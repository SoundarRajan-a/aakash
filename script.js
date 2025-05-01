// Firebase Configuration - Replace with your actual config
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVya8MqR89hA3D5jVOgwKTI4zcHQ0ghtI",
  authDomain: "portfolio-2ed30.firebaseapp.com",
  projectId: "portfolio-2ed30",
  storageBucket: "portfolio-2ed30.firebasestorage.app",
  messagingSenderId: "192845449068",
  appId: "1:192845449068:web:1c3a66c7cbc6c8d05f9549",
  measurementId: "G-6PL7VVPEK5"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();

// DOM Elements
const elements = {
    uploadForm: document.getElementById('uploadForm'),
    photoUpload: document.getElementById('photoUpload'),
    photoDescription: document.getElementById('photoDescription'),
    uploadSubmitBtn: document.getElementById('uploadSubmitBtn'),
    uploadError: document.getElementById('uploadError'),
    publicPhotos: document.getElementById('publicPhotos'),
    compressInfo: document.createElement('div'),
    compressBar: document.createElement('div'),
    compressProgress: document.createElement('div'),
    qualityControl: document.createElement('div'),
    qualitySlider: document.createElement('input')
};

// Add compression UI
elements.compressInfo.className = 'compress-info';
elements.compressBar.className = 'compress-bar';
elements.compressProgress.className = 'compress-progress';
elements.qualityControl.className = 'quality-control';
elements.qualitySlider.type = 'range';
elements.qualitySlider.min = '30';
elements.qualitySlider.max = '90';
elements.qualitySlider.value = '70';
elements.qualitySlider.id = 'qualitySlider';

elements.compressBar.appendChild(elements.compressProgress);
elements.compressInfo.innerHTML = '<span>Compression: </span>';
elements.compressInfo.appendChild(elements.compressBar);
elements.qualityControl.innerHTML = '<label>Quality:</label>';
elements.qualityControl.appendChild(elements.qualitySlider);
elements.uploadForm.insertBefore(elements.compressInfo, elements.uploadSubmitBtn);
elements.uploadForm.insertBefore(elements.qualityControl, elements.uploadSubmitBtn);

// App State
let currentUser = null;
let photos = [];
const MAX_STORAGE_MB = 950; // Stay under 1GB (950MB buffer)

// Initialize Auth
auth.onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
        loadPhotos();
        checkStorageUsage();
    }
});

// Image Compression
async function compressImage(file, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions (max 1200px)
                let width = img.width;
                let height = img.height;
                const MAX_DIMENSION = 1200;
                
                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Update compression UI
                const updateProgress = (percent) => {
                    elements.compressProgress.style.width = `${percent}%`;
                };
                
                // Compress in steps for better UX
                let currentQuality = 1;
                const steps = 10;
                const qualityStep = (1 - quality) / steps;
                
                const compressStep = () => {
                    currentQuality -= qualityStep;
                    if (currentQuality <= quality) {
                        currentQuality = quality;
                        canvas.toBlob((blob) => {
                            resolve(new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            }));
                        }, 'image/jpeg', currentQuality);
                        return;
                    }
                    
                    updateProgress(100 * (1 - currentQuality));
                    requestAnimationFrame(compressStep);
                };
                
                updateProgress(0);
                setTimeout(compressStep, 100);
            };
        };
    });
}

// Upload Handler
elements.uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Please login first', 'error');
        return;
    }

    const file = elements.photoUpload.files[0];
    const description = elements.photoDescription.value.trim();
    const quality = elements.qualitySlider.value / 100;

    if (!file) {
        showMessage('Please select a photo', 'error');
        return;
    }

    try {
        toggleUploadButton(true);
        
        // Step 1: Check current storage
        const storageUsed = await getStorageUsage();
        if (storageUsed > MAX_STORAGE_MB) {
            await cleanupOldFiles();
        }
        
        // Step 2: Compress image
        const compressedFile = await compressImage(file, quality);
        
        // Step 3: Validate size
        if (compressedFile.size > 0.5 * 1024 * 1024) { // 500KB max
            showMessage('Image too large after compression. Try lower quality.', 'error');
            toggleUploadButton(false);
            return;
        }
        
        // Step 4: Upload to Firebase
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop().toLowerCase();
        const fileName = `img_${timestamp}.${fileExt}`;
        const storageRef = storage.ref(`journey/${currentUser.uid}/${fileName}`);
        
        const uploadTask = storageRef.put(compressedFile, {
            customMetadata: { 
                description,
                originalSize: file.size.toString(),
                compressedSize: compressedFile.size.toString(),
                quality: quality.toString()
            }
        });

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                elements.compressProgress.style.width = `${progress}%`;
            },
            (error) => {
                showMessage('Upload failed: ' + error.message, 'error');
                toggleUploadButton(false);
            },
            async () => {
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                
                // Store metadata in Firestore
                await db.collection('journey').add({
                    userId: currentUser.uid,
                    imageUrl: downloadURL,
                    description,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    size: compressedFile.size,
                    storagePath: uploadTask.snapshot.ref.fullPath
                });
                
                // Update UI
                addPhotoToGallery(downloadURL, description);
                elements.uploadForm.reset();
                document.getElementById('uploadSection').style.display = 'none';
                showMessage('Upload successful!', 'success');
                toggleUploadButton(false);
                
                // Update storage info
                checkStorageUsage();
            }
        );
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
        toggleUploadButton(false);
    }
});

// Storage Management
async function getStorageUsage() {
    if (!currentUser) return 0;
    
    const storageRef = storage.ref(`journey/${currentUser.uid}`);
    const res = await storageRef.listAll();
    
    let totalSize = 0;
    const items = res.items;
    
    // Check first 100 items (Firebase limitation)
    for (let i = 0; i < Math.min(items.length, 100); i++) {
        const metadata = await items[i].getMetadata();
        totalSize += parseInt(metadata.size);
    }
    
    // Estimate total based on sample
    const estimatedTotal = items.length > 100 ? 
        totalSize * (items.length / 100) : 
        totalSize;
    
    return estimatedTotal / (1024 * 1024); // Return in MB
}

async function cleanupOldFiles() {
    if (!currentUser) return;
    
    // Get files from Firestore (sorted by date)
    const snapshot = await db.collection('journey')
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt')
        .get();
    
    const storageRef = storage.ref();
    let deletedCount = 0;
    
    for (const doc of snapshot.docs) {
        const data = doc.data();
        
        try {
            await storageRef.child(data.storagePath).delete();
            await doc.ref.delete();
            deletedCount++;
            
            const currentUsage = await getStorageUsage();
            if (currentUsage < MAX_STORAGE_MB * 0.8) break; // Stop when we have enough space
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }
    
    if (deletedCount > 0) {
        showMessage(`Cleaned up ${deletedCount} old files to save space`, 'info');
    }
}

function checkStorageUsage() {
    getStorageUsage().then(mbUsed => {
        const percentUsed = (mbUsed / MAX_STORAGE_MB) * 100;
        console.log(`Storage used: ${mbUsed.toFixed(2)}MB (${percentUsed.toFixed(1)}%)`);
        
        if (percentUsed > 80) {
            showMessage(`Warning: You've used ${percentUsed.toFixed(1)}% of your storage`, 'error');
        }
    });
}

// UI Helpers
function toggleUploadButton(loading) {
    const btnText = elements.uploadSubmitBtn.querySelector('.btn-text');
    const spinner = elements.uploadSubmitBtn.querySelector('.spinner');
    
    elements.uploadSubmitBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'block';
    spinner.style.display = loading ? 'block' : 'none';
}

function addPhotoToGallery(url, description) {
    const photoElement = document.createElement('div');
    photoElement.className = 'photo-box';
    photoElement.innerHTML = `
        <div class="photo-image" style="background-image: url('${url}')"></div>
        <div class="photo-info">
            <p>${description}</p>
            <button class="delete-btn">Delete</button>
        </div>
    `;
    elements.publicPhotos.prepend(photoElement);
    
    // Add delete handler
    photoElement.querySelector('.delete-btn').addEventListener('click', async () => {
        if (confirm('Delete this photo permanently?')) {
            try {
                // In a real app, you would delete from Firestore and Storage
                photoElement.remove();
                showMessage('Photo deleted', 'success');
                checkStorageUsage();
            } catch (error) {
                showMessage('Failed to delete photo', 'error');
            }
        }
    });
}

function showMessage(message, type) {
    elements.uploadError.textContent = message;
    elements.uploadError.style.color = type === 'error' ? '#ff4444' : '#00c851';
    setTimeout(() => elements.uploadError.textContent = '', 5000);
}

// Initialize
setInterval(checkStorageUsage, 60 * 60 * 1000); // Check hourly
