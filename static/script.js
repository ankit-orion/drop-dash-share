document.addEventListener('DOMContentLoaded', function () {
     const dropArea = document.getElementById('dropArea');
     const fileInput = document.getElementById('fileInput');
     const fileLinks = document.getElementById('fileLinks'); // Container for file links
     const expirationButtons = document.querySelectorAll(".expiration-button");
     const customExpirationInput = document.getElementById("customExpiration");
     const secret = document.getElementById("secret");

     // Find the initially selected button with the "selected" class
     const initiallySelectedButton = document.querySelector(".expiration-button.selected");

     // Get the selected expiration time in minutes from the initially selected button
     let selectedExpiration = initiallySelectedButton ? parseInt(initiallySelectedButton.getAttribute("data-expiration")) : 60;

     dropArea.addEventListener('dragover', function (e) {
          e.preventDefault();
          dropArea.classList.add('drag-over');
     });

     dropArea.addEventListener('dragleave', function () {
          dropArea.classList.remove('drag-over');
     });

     dropArea.addEventListener('drop', function (e) {
          e.preventDefault();
          dropArea.classList.remove('drag-over');

          const files = e.dataTransfer.files;
          handleFiles(files);
     });

     fileInput.addEventListener('change', function () {
          const files = fileInput.files;
          handleFiles(files);
     });

     function handleExpirationClick(button) {
          // Remove the "selected" class from all buttons and the custom input
          expirationButtons.forEach((btn) => btn.classList.remove("selected"));
          customExpirationInput.classList.remove("selected");

          // Add the "selected" class to the clicked button
          button.classList.add("selected");

          // Get the selected expiration time in minutes from the button's data-expiration attribute
          selectedExpiration = parseInt(button.getAttribute("data-expiration"));
          // console.log(selectedExpiration);
     }

     // Add a click event listener to each expiration button
     expirationButtons.forEach((button) => {
          button.addEventListener("click", function () {
               handleExpirationClick(button);
          });
     });

     // Add a click event listener to the custom input
     customExpirationInput.addEventListener("input", function () {
          // Remove the "selected" class from all buttons and the custom input
          expirationButtons.forEach((btn) => btn.classList.remove("selected"));
          customExpirationInput.classList.add("selected");
     });

     function handleFiles(files) {
          for (const file of files) {
               // Check if the file size exceeds the limit (in bytes)
               const maxFileSize = 1024 * 1024 * 1024;
               if (file.size > maxFileSize) {
                    // Display an alert message in the browser
                    alert('File size exceeds the limit (1GB). Please choose a smaller file.');
               } else {
                    uploadFile(file, selectedExpiration); // Pass the selected expiration value
               }
          }
     }

     function uploadFile(file, selectedExpiration) {
          const customExpirationValue = customExpirationInput.value;

          // Validate custom expiration input only if it's not empty
          if (customExpirationValue !== '' && !isValidNumber(customExpirationValue)) {
               alert('Please enter a valid numeric value for custom expiration.');
               return;
          }
          // if there is selectedExpiration, then customExpirationValue will be null AND set custom expiration to selected expiration value



          let customExpiration = customExpirationValue !== '' ? parseInt(customExpirationValue) : selectedExpiration;

          // Check for maximum allowed custom expiration (30 days) only if it's a valid number and greater than or equal to 0
          if (customExpiration === null || customExpiration <= 0 || customExpiration >= 43200) {
               alert('Please enter a value less than or equal to 43200 (30 days) for custom expiration.');
               return;
          }


          const formData = new FormData();
          formData.append('fileInput', file);
          formData.append('expiration', customExpiration || selectedExpiration); // Use custom value if present, otherwise use selected expiration
          formData.append('secret', secret.value || null);
          console.log("Logging form data:");
          console.log(formData);
          for (var pair of formData.entries()) {
               console.log(pair[0] + ', ' + pair[1]);
          }
          fetch('/upload', {
                    method: 'POST',
                    body: formData
               })
               .then(response => response.text())
               .then(result => {
                    // Handle the response as needed
                    const fileLink = document.createElement('p');
                    const fileName = file.name; // Get the original file name
                    fileLink.innerHTML = `<a href="${result}" target="_blank">${fileName}</a>`;
                    fileLinks.appendChild(fileLink);

                    // Clear the file input and custom expiration input to allow selecting and uploading another file
                    fileInput.value = '';
                    customExpirationInput.value = '';
                    secret.value = '';
               })
               .catch(error => {
                    console.error('Error:', error);
               });
     }

     function isValidNumber(value) {
          // Check if the input is a valid number
          return /^\d+$/.test(value);
     }


});