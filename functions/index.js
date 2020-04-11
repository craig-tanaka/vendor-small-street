/*jshint esversion: 8 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const path = require('path');
const os = require('os');
const fs = require('fs');
const jimp = require('jimp');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.copyToNew = functions.firestore
    .document(`products/{productId}`)
    .onCreate((snap) => {
        return admin.firestore().doc(`/new/${snap.id}`)
            .set(snap.data());
    });

exports.updateNewReference = functions.firestore
    .document(`products/{productID}`)
    .onUpdate((change, context) => {
        return admin.firestore().doc(`/new/${change.after.id}`)
            .set(change.after.data());
    });

exports.deleteNewReference = functions.firestore
    .document(`products/{productID}`)
    .onDelete((change, context) => {
        return admin.firestore().doc(`/new/${change.id}`)
            .delete();
    });

exports.deleteProductImages = functions.firestore
    .document(`products/{productID}`)
    .onDelete((change, context) => {
        const { productID } = context.params;
        return admin.storage().bucket().deleteFiles({
            prefix: `product-images/${productID}`
        });
    });

exports.convertImageToJpeg = functions.storage.object().onFinalize(async (object) => {
    console.log(">>>>>>>>>>>>Printing Files<<<<<<<<<<<<<<<<<<")
    fs.readdirSync(os.tmpdir()).forEach(file => {
        console.log(file);
    });
    if (fs.existsSync(`${os.tmpdir()}/converted/`)) {
        console.log("printing converted")
        fs.readdirSync(`${os.tmpdir()}/converted/`).forEach(file => {
            console.log(`.......${file}`);
        });
    }
    console.log(">>>>>>>>>>>>Printing Files<<<<<<<<<<<<<<<<<<")

    // if (object.metadata === undefined) return console.log('image already converted');
    // console.log(object.data.metadata)
    if (object.metadata === undefined) return console.log(object.metadata);
    console.log(`object.metadata = ${object.metadata}`);
    console.log(`object.metadata.customMetadata = ${object.metadata.customMetadata}`);
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

    if (!contentType.startsWith('image')) {
        return console.error('This is not an image.')
    }

    // Get the file name.
    const fileName = path.basename(filePath);

    const bucket = admin.storage().bucket(object.bucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const outputFolder = path.join(os.tmpdir(), '/converted/');
    await bucket.file(filePath).download({
            destination: tempFilePath
        })
        .catch(error => {
            console.log(error);
            return;
        });

    console.log('image downloaded locally to ', tempFilePath);

    let minifiedFile = path.join(os.tmpdir(), '01.jpg');

    console.log('Converting and minifying file........');

    // conversion and minification
    // todo: minification improvement test
    // remove metadata especially from jpeg files

    await jimp.read(tempFilePath)
        .then(file => {
            return file
                .quality(60)
                .write(minifiedFile);
        })
        .catch(err => {
            console.log(err);
        })

    console.log('Converting to progressive jpeg');

    async function convertImage() {

        const files = await imagemin([minifiedFile], {
            destination: outputFolder,
            plugins: [
                imageminMozjpeg({
                    progressive: true,
                    quality: 70
                })
            ]
        });

        return console.log('image converted returned : ', files);
    }


    const outputFile = path.join(outputFolder, path.basename(minifiedFile));

    await convertImage().catch(error => console.log(error));

    await bucket.file(filePath).delete()
        .catch((error) => {
            console.log(error);
            return;
        });
    const outputFilePath = filePath.replace(fileName, '00.jpg');
    // todo: delete temp files

    await bucket.upload(outputFile, {
            destination: outputFilePath
        })
        .then(() => {

            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            if (fs.existsSync(minifiedFile)) fs.unlinkSync(minifiedFile);
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);

            return console.log('image uploaded to: ', outputFilePath);
        })

    return bucket.file(outputFilePath).setMetadata({
        metadata: {
            converted: true
        }
    })
    .then(metadata => {
        console.log('Updated Metadata........');
        return console.log(metadata);
    })

});

exports.onUserDelete = functions.auth.user().onDelete((user) => {
    // TODO send user bye email
    console.log(`Deleting user ${user.displayName}`);
    return admin.firestore().doc(`/carts/${user.email}`).delete();
});

exports.onUserSignUp = functions.auth.user().onCreate((user) => {
    //  TODO send user greeting email
    console.log(`Creating user, ${user.displayName} cart`);
    return admin.firestore().doc(`/carts/${user.uid}`).set({
        Products: []
    });
  });