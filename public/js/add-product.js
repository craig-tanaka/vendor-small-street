try {
    window.db = firebase.firestore();
    window.storageRef = firebase.storage().ref();
} catch (ReferenceError) {
    console.log('Firebase not found');
}

const form = document.querySelector('form');
const productNameInput = document.querySelector('#product-name');
const productCategoryInput = document.querySelector('#product-category');
const productBrandInput = document.querySelector('#product-brand');
const productPriceInput = document.querySelector('#product-price');
const productDescriptionInput = document.querySelector('#product-description');
const productTagsInput = document.querySelector('#product-tags');

const browseBtn = document.querySelector('#browse-btn');
const fileInfo = document.querySelector('#file-info');
const realImageInput = document.querySelector('#real-image-input');
const productImagePreview = document.querySelector('#product-image-preview');
const formResetBtn = document.querySelector('#form-reset');

let ImageUrl = '';
let image = {};
let ImageName = '';
let fileExt = '';
let DocRef = {};

productImagePreview.addEventListener('click', event => {
    realImageInput.click();
})

realImageInput.addEventListener('change', () => {
    const name = realImageInput.value.split(/\\|\//).pop();
    const truncated = name.length > 20 ?
        name.substr(name.length - 20) :
        name;
    const re = /(?:\.([^.]+))?$/;

    ImageUrl = window.URL.createObjectURL(realImageInput.files[0]);
    image = realImageInput.files[0];
    ImageName = truncated;
    fileExt = re.exec(truncated)[1];
    productImagePreview.style.backgroundImage = `url(${ImageUrl})`;
    productImagePreview.style.backgroundColor = 'initial';
    productImagePreview.innerHTML = '';
});


form.onsubmit = event => {
    event.preventDefault();

    // validateForm();
    logProgress(`Uploading Product Details .....`);
    document.querySelector('main').style.display = 'none';
    document.querySelector('.loader-container').style.display = 'initial';

    uploadDocument();

    return false;
}

function validateForm() {
    //  implement form validation logic
}

// Get tags from Product name and brand
function uploadDocument() {
    db.collection("products").add({
            ProductName: productNameInput.value,
            Price: productPriceInput.value,
            Brand: productBrandInput.value,
            Category: productCategoryInput.value,
            Description: productDescriptionInput.value,
            Tags: productTagsInput.value.toLowerCase().split(/[ .,]+/),
            UploadTimestamp: firebase.firestore.Timestamp.now().seconds
        })
        .then(function (docRef) {
            logProgress(`Product details upload finished.`);
            DocRef = docRef;
            logProgress(`Begining Image Upload.`);
            uploadImage();
        })
        .catch(function (error) {
            logProgress(`Product details upload failed. Please try again in a few minutes or contact developer`);
            console.error("Error adding document: ", error);
        });
}

function uploadImage() {
    let uploadTask = storageRef.child('product-images/' + DocRef.id + '/00.' + fileExt).put(image);

    uploadTask.on('state_changed', function (snapshot) {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        logProgress(`Image Upload is ${progress.toPrecision(3)}% done...`);

        if (snapshot.state === firebase.storage.TaskState.PAUSED)
            logProgress('Image Uploaded Paused');
    }, function (error) {
        logProgress('upload unsuccessful. Please try again in a few minutes or contact developer;');
        // Handle unsuccessful uploads
    }, function () {
        // Handle successful uploads on complete
        logProgress('Image upload successful');


        setTimeout(() => {
            document.querySelector('main').style.display = 'flex';
            document.querySelector('.loader-container').style.display = 'none';
            formResetBtn.click();
            realImageInput.value = '';
            productImagePreview.style.backgroundImage = '';
            productImagePreview.style.backgroundColor = 'white';
        }, 1000)
    });
}

function logProgress(message) {
    document.querySelector('.loader-text').innerHTML = message;
}