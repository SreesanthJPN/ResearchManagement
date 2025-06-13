document.addEventListener('DOMContentLoaded', () => {
    const fileList = document.getElementById('fileList');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');

    // Debug log to verify elements are found
    console.log('Upload button:', uploadBtn);
    console.log('File input:', fileInput);

    // Fetch and display files
    async function loadFiles() {
        fileList.innerHTML = '<div class="loading">Loading files...</div>';
        try {
            const res = await fetch('/dash/getFileNames', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch files');
            const files = await res.json();
            if (!Array.isArray(files) || files.length === 0) {
                fileList.innerHTML = '<div class="no-files">No files found.</div>';
                return;
            }
            fileList.innerHTML = files.map(file => `
                <div class="file-card">
                    <i class="fa fa-file-alt file-icon"></i>
                    <span class="file-name">${file}</span>
                </div>
            `).join('');
        } catch (err) {
            fileList.innerHTML = '<div class="error-msg">Error loading files.</div>';
            console.error('Error loading files:', err);
        }
    }

    // Upload files - Updated click handler
    if (uploadBtn && fileInput) {
        uploadBtn.onclick = function(e) {
            e.preventDefault();
            console.log('Upload button clicked');
            fileInput.click();
        };

        fileInput.onchange = async function() {
            console.log('File input changed');
            if (!fileInput.files.length) return;
            
            const formData = new FormData();
            for (const file of fileInput.files) {
                formData.append('files', file);
            }
            
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
            
            try {
                const res = await fetch('files/uploadLocalFiles', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });
                
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.message || 'Upload failed');
                }
                
                await loadFiles();
            } catch (err) {
                console.error('Upload error:', err);
                alert('File upload failed: ' + err.message);
            } finally {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = '<i class="fa fa-plus"></i>';
                fileInput.value = '';
            }
        };
    } else {
        console.error('Upload button or file input not found!');
    }

    loadFiles();
}); 