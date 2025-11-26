// Global variable to hold the current file name
let originalFilename = '';
$(document).ready(function() {
    // Loader Element using jQuery
    const $loader = $('#loader');

    // document.addEventListener('contextmenu', function(event) {
    //     // Prevent the context menu from showing
    //     event.preventDefault();
        
    //     // Redirect to the home page ('/')
    //     window.location.href = '/';
    // });

    function showLoader() {
        $loader.addClass('show').removeClass('hide');
        $('#drop-area').css('pointer-events', 'none'); // Disable drop area
    }

    function hideLoader() {
        $loader.addClass('hide').removeClass('show');
        $('#drop-area').css('pointer-events', 'auto'); // Enable drop area
    }

    const dropArea = document.getElementById('drop-area');
    
    if (dropArea) {
        // Prevent default behaviors for drag/drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false)
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Highlight the drop area when a file is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.style.backgroundColor = '#e0e0e0';
            }, false)
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.style.backgroundColor = '#f9f9f9';
            }, false)
        });
    }
    // Store original data for reverting changes
    let originalData = {
        email_data: {},
        AI_Response: {},
        sheet_value: [],
        rod_value: [],
        tube_value: [],
        ring_value:[]
    };

    if (dropArea){
        // Handle file drop
        dropArea.addEventListener('drop', handleDrop, false);
    }
    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;

        uploadFile(files[0]); // Only handle one file for simplicity
    }

    // File upload function (using jQuery)
    function uploadFile(file) {

        if (!file.name.toLowerCase().endsWith('.eml')){
            alert('Invalid file type. Please upload .eml file.');
            return; // Exit the function to prevent the GET request
        }
        showLoader();
        originalFilename = file.name.replace('.eml', ''); // Set the global variable with the file name

        let formData = new FormData(); // Create a new FormData object
        formData.append('file', file); // Append the dropped file to the FormData object

        // Use your jQuery-based file upload function
        $.ajax({
            url: '/upload_eml_file', // Endpoint to upload the file
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                // alert(response.message); // Notify user about success

                // After successful upload, fetch the processed data and display it
                fetchProcessedData(file.name.replace(".eml", ""));
            },
            // error: function(err) {
            //     console.error('Error:', err);
            //     alert('File upload failed.');
            //     hideLoader();
            // }
        });
    }
    
    // Function to fetch processed JSON data via GET request
    // function fetchProcessedData(filename) {
    //     $.ajax({
    //         url: '/get_data', // Endpoint to fetch the JSON data
    //         type: 'GET',
    //         data: { filename: filename }, // Pass the filename as a query parameter
    //         dataType: 'json',
    //         success: function(data) {
    //             // Store original data for revert functionality
    //             originalData = JSON.parse(JSON.stringify(data));

    //             // Populate the AI response, email content, and tables with the data
    //             populateAIResponse(data.AI_Response);
    //             populateEmailContent(data.email_data);
    //             populateSheetsTable(data.AI_Response.sheet_value);
    //             populateRodsTable(data.AI_Response.rod_value);
    //             populateTubesTable(data.AI_Response.tube_value);
    //             populateRingsTable(data.AI_Response.ring_value);

    //             // Hide loader after data is fetched and displayed
    //             hideLoader();
    //         },
    //         error: function(err) {
    //             console.error('Error fetching data:', err);
    //             alert('Failed to fetch the data.');
    //             hideLoader();
    //         }
    //     });
    // }

    function fetchProcessedData(filename, directoryname, toindex) {
        
        $.ajax({
            url: '/get_data', // Endpoint to fetch the JSON data
            type: 'GET',
            data: { filename: filename, directoryname: directoryname }, // Pass the filename as a query parameter
            dataType: 'json',
            success: function(data) {
                // Store original data for revert functionality
                // console.log(JSON.stringify(data));
                originalData = JSON.parse(JSON.stringify(data));
                // console.log(data)
                // if (toindex == true) {
                //     //     window.location.href = '/';
                //     // }
                //     file_data = data.filename
                //     window.location.href = `/get_data_render_temp/${encodeURIComponent(file_data)}`;
                //     console.log("Hello")
                // }
                if (toindex === true) {
                    originalData = JSON.parse(JSON.stringify(data.data));
                    const file_data = data.filename;
                    originalFilename = data.filename
                    // window.location.href = `/get_data_render_temp/${encodeURIComponent(file_data)}`;
                    localStorage.setItem("file_name", JSON.stringify(data.filename))
                    document.getElementById("index_page").style.display = 'block';
                    document.getElementById("fileDiv").style.display = 'none';
                    // document.getElementById("ai_response").style.display = 'none';
                    document.getElementById("dragDrop").style.display = 'none';
                    
                    document.getElementById("updateMode").style.display = 'block';
                    document.getElementById("finetune-json").innerText="Fine tune updated processed file";
                    document.getElementById("updateMode").innerText="Update Mode";
                    document.getElementById("updateMode").innerHTML="Update Mode";
                    
                    for_ai_response = {
                        sheet_value: data.data.sheet_value,
                        rod_value: data.data.rod_value,
                        tube_value: data.data.tube_value,
                        ring_value: data.data.ring_value
                    }
                    populateAIResponse(for_ai_response);
                    populateEmailContent(data.data.email_data);
                    populateSheetsTable(data.data.sheet_value);
                    populateRodsTable(data.data.rod_value);
                    populateTubesTable(data.data.tube_value);
                    populateRingsTable(data.data.ring_value);
                    // return; // Exit to prevent further code execution after redirection
                }
                else{
                    document.getElementById("ai_response").style.display = 'block';
                    populateAIResponse(data.AI_Response);
                    populateEmailContent(data.email_data);
                    populateSheetsTable(data.AI_Response.sheet_value);
                    populateRodsTable(data.AI_Response.rod_value);
                    populateTubesTable(data.AI_Response.tube_value);
                    populateRingsTable(data.AI_Response.ring_value);
                }
                // window.location.href = `/get_data_render_temp/${encodeURIComponent(data.filename)}`
                
                // Hide loader after data is fetched and displayed
                hideLoader();
            },
            error: function(err) {
                console.error('Error fetching data:', err);
                alert('Failed to fetch the data.');
                hideLoader();
            }
        });
    }
    
    // Function to populate AI Response
    function populateAIResponse(aiData) {
        $('#ai-response').text(JSON.stringify(aiData, null, 2));
    }

    // Function to populate Email Content
    function populateEmailContent(emailBody) {
        $('#email-content').text(emailBody.body);
    }
    
    function populateSheetsTable(sheetData) {
        var tbody = $('#sheets-table-body');
        tbody.empty(); // Clear existing data
    
        // Define a normalized mapping of lowercase keys to the table headers
        const headerMap = {
            "grade": "Grade",
            "color": "Color",
            "length": "Length",
            "length + tolerance": "Length + Tolerance",
            "length - tolerance": "Length - Tolerance",
            "length unit of measure": "Length Unit of Measure",
            "width": "Width",
            "width + tolerance": "Width + Tolerance",
            "width - tolerance": "Width - Tolerance",
            "width unit of measure": "Width Unit",
            "thickness": "Thickness",
            "thickness + tolerance": "Thickness + Tolerance",
            "thickness - tolerance": "Thickness - Tolerance",
            "thickness unit of measure": "Thickness Unit of Measure",
            "number of masked sides": "Number of Masked sides",
            "number of sanded sides": "Number of Sanded Sides",
            "grain direction": "Grain Direction",
            "quantity": "Quantity",
            "quantity unit of measure": "Quantity Unit of Measure",
            "testing required": "Testing Required",
            "domestic material": "Domestic Material"
        };
    
        if (!sheetData || sheetData.length === 0) {
            add_sheets_Row('sheets-table-body');
        } else {
            sheetData.forEach(function(row, rowIndex) {
                var tr = $('<tr></tr>');
                
                // Iterate over headers to maintain order
                $('#sheets-table thead th').each(function(index, th) {
                    let header = $(th).text().trim();
                    let cellValue;
    
                    // Check if the exact header text exists in row, if not normalize the key
                    if (row.hasOwnProperty(header)) {
                        cellValue = row[header] || ''; // Use the exact key if present
                    } else {
                        let normalizedKey = Object.keys(headerMap).find(key => headerMap[key] === header);
                        cellValue = normalizedKey ? row[normalizedKey] || '' : ''; // Use normalized key
                    }
    
                    var td = $('<td></td>');
    
                    // Check if the current column should be a dropdown
                    if (header === "Testing Required" || header === "Domestic Material") {
                        var select = $('<select class="form-control"></select>');
                        select.append($('<option value="">Select</option>'));
                        select.append($('<option value="true">True</option>'));
                        select.append($('<option value="false">False</option>'));
                        select.val(cellValue.toLowerCase()); // Set the value based on data
                        td.append(select);
                    } else if (header === "Line") {
                        td.text(rowIndex + 1);
                    } else if (header === "Edit/Delete") {
                        td.html(`
                            <button class="btn btn-info add-sheet-row">+</button>
                            <button class="btn btn-danger remove-row">-</button>
                        `);
                    } else {
                        var input = $('<input type="text" class="form-control">').val(cellValue);
                        td.append(input);
                    }
    
                    tr.append(td);
                });
                tbody.append(tr);
            });
        }
    }
    
    // // Function to populate Sheets Table
    // function populateSheetsTable(sheetData) {
    //     var tbody = $('#sheets-table-body');
    //     tbody.empty(); // Clear existing data

    //     if (!sheetData || sheetData.length === 0) {
    //         tbody.append('<tr><td colspan="21" class="text-center">No Data</td></tr>');
    //     } else {
    //         sheetData.forEach(function(row) {
    //             var tr = $('<tr></tr>');
    //             row.forEach(function(cell) {
    //                 var td = $('<td></td>');
    //                 var input = $('<input type="text" class="form-control">').val(cell);
    //                 td.append(input);
    //                 tr.append(td);
    //             });
    //             tbody.append(tr);
    //         });
    //     }
    // }

    function populateRodsTable(rodData) {
        var tbody = $('#rods-table-body');
        tbody.empty(); // Clear existing data
    
        // Define a normalized mapping of lowercase keys to the table headers
        const headerMap = {
            "grade": "Grade",
            "color": "Color",
            "diameter": "Diameter",
            "diameter + tolerance": "Diameter + Tolerance",
            "diameter - tolerance": "Diameter - Tolerance",
            "diameter unit of measure": "Diameter Unit of Measure",
            "length": "Length",
            "length + tolerance": "Length + Tolerance",
            "length - tolerance": "Length - Tolerance",
            "length unit of measure": "Length Unit of Measure",
            "quantity": "Quantity",
            "quantity unit of measure": "Quantity Unit of Measure",
            "rolled and molded": "Rolled and Molded",
            "testing required": "Testing Required",
            "domestic material": "Domestic Material",
            "hex rod":"Hex Rod"
        };
    
        if (!rodData || rodData.length === 0) {
            add_rods_Row('rods-table-body');
        } else {
            rodData.forEach(function(row, rowIndex) {
                var tr = $('<tr></tr>');
                
                // Iterate over headers to maintain order
                $('#rods-table thead th').each(function(index, th) {
                    let header = $(th).text().trim();
                    let cellValue;
    
                    // Check if the exact header text exists in row, if not normalize the key
                    if (row.hasOwnProperty(header)) {
                        cellValue = row[header] || ''; // Use the exact key if present
                    } else {
                        let normalizedKey = Object.keys(headerMap).find(key => headerMap[key] === header);
                        cellValue = normalizedKey ? row[normalizedKey] || '' : ''; // Use normalized key
                    }
    
                    var td = $('<td></td>');
    
                    // Check if the current column should be a dropdown
                    if (header === "Testing Required" || header === "Domestic Material" || header ==="Hex Rod" || header === "Rolled and Molded") {
                        var select = $('<select class="form-control"></select>');
                        select.append($('<option value="">Select</option>'));
                        select.append($('<option value="true">True</option>'));
                        select.append($('<option value="false">False</option>'));
                        select.val(cellValue.toLowerCase()); // Set the value based on data
                        td.append(select);
                    } else if (header === "Line") {
                        td.text(rowIndex + 1);
                    } else if (header === "Edit/Delete") {
                        td.html(`
                            <button class="btn btn-info add-rods-row">+</button>
                            <button class="btn btn-danger remove-row">-</button>
                        `);
                    } else {
                        var input = $('<input type="text" class="form-control">').val(cellValue);
                        td.append(input);
                    }
    
                    tr.append(td);
                });
                tbody.append(tr);
            });
        }
    }
    
    // Function to populate Rods Table
    // function populateRodsTable(rodData) {
    //     var tbody = $('#rods-table-body');
    //     tbody.empty(); // Clear existing data

    //     if (!rodData || rodData.length === 0) {
    //         // tbody.append('<tr><td colspan="16" class="text-center">No Data</td></tr>');
    //         add_rods_Row('rods-table-body')
    //     } else {
    //         rodData.forEach(function(row, rowIndex) {
    //             var tr = $('<tr></tr>');
    //             $('#rods-table thead th').each(function(index, th) {
    //                 let header = $(th).text().trim();
    //                 let cellValue = row[header] || '';
    //                 var td = $('<td></td>');
    //                 // Check if the current column should be a dropdown
    //                 if (header === "Testing Required" || header === "Domestic Material" || header === "Rolled and Molded") {
    //                     var select = $('<select class="form-control"></select>');
    //                     select.append($('<option value="">Select</option>'));
    //                     select.append($('<option value="true">True</option>'));
    //                     select.append($('<option value="false">False</option>'));
    //                     select.val(cellValue); // Set the value based on data
    //                     td.append(select);
    //                 }
    //                 else if( header === "Line"){
    //                     td.text(rowIndex + 1);
    //                 }
    //                 else if(header === "Edit/Delete"){
    //                     td.html(`
    //                        <button class="btn btn-info add-rods-row">+</button>
    //                        <button class="btn btn-danger remove-row">-</button>
    //                     `);
    //                 }
    //                 else {
    //                     var input = $('<input type="text" class="form-control">').val(cellValue);
    //                     td.append(input);
    //                 }

    //                 tr.append(td);

    //             });
    //             tbody.append(tr);
    //         });
    //     }
    // }

    // // Function to populate Rods Table
    // function populateRodsTable(rodData) {
    //     var tbody = $('#rods-table-body');
    //     tbody.empty(); // Clear existing data

    //     if (!rodData || rodData.length === 0) {
    //         tbody.append('<tr><td colspan="15" class="text-center">No Data</td></tr>');
    //     } else {
    //         rodData.forEach(function(row) {
    //             var tr = $('<tr></tr>');
    //             row.forEach(function(cell) {
    //                 var td = $('<td></td>');
    //                 var input = $('<input type="text" class="form-control">').val(cell);
    //                 td.append(input);
    //                 tr.append(td);
    //             });
    //             tbody.append(tr);
    //         });
    //     }
    // }

    function populateTubesTable(tubeData) {
        var tbody = $('#tubes-table-body');
        tbody.empty(); // Clear existing data
    
        // Define a normalized mapping of lowercase keys to the table headers
        const headerMap = {
            "grade": "Grade",
            "color": "Color",
            "outer diameter": "Outer Diameter",
            "outer diameter + tolerance": "Outer Diameter + Tolerance",
            "outer diameter - tolerance": "Outer Diameter - Tolerance",
            "outer diameter unit of measure": "Outer Diameter Unit of Measure",
            "inner diameter": "Inner Diameter",
            "inner diameter + tolerance": "Inner Diameter + Tolerance",
            "inner diameter - tolerance": "Inner Diameter - Tolerance",
            "inner diameter unit of measure": "Inner Diameter Unit",
            "length": "Length",
            "length + tolerance": "Length + Tolerance",
            "length - tolerance": "Length - Tolerance",
            "length unit of measure": "Length Unit of Measure",
            "quantity": "Quantity",
            "quantity unit of measure": "Quantity Unit of Measure",
            "testing required": "Testing Required",
            "domestic material": "Domestic Material"
        };
    
        if (!tubeData || tubeData.length === 0) {
            add_tubes_Row('tubes-table-body');
        } else {
            tubeData.forEach(function(row, rowIndex) {
                var tr = $('<tr></tr>');
    
                // Iterate over headers to maintain order
                $('#tubes-table thead th').each(function(index, th) {
                    let header = $(th).text().trim();
                    let cellValue;
    
                    // Check if the exact header text exists in row, if not normalize the key
                    if (row.hasOwnProperty(header)) {
                        cellValue = row[header] || ''; // Use the exact key if present
                    } else {
                        let normalizedKey = Object.keys(headerMap).find(key => headerMap[key] === header);
                        cellValue = normalizedKey ? row[normalizedKey] || '' : ''; // Use normalized key
                    }
    
                    var td = $('<td></td>');
    
                    // Check if the current column should be a dropdown
                    if (header === "Testing Required" || header === "Domestic Material") {
                        var select = $('<select class="form-control"></select>');
                        select.append($('<option value="">Select</option>'));
                        select.append($('<option value="true">True</option>'));
                        select.append($('<option value="false">False</option>'));
                        select.val(cellValue.toLowerCase()); // Set the value based on data
                        td.append(select);
                    } else if (header === "Line") {
                        td.text(rowIndex + 1);
                    } else if (header === "Edit/Delete") {
                        td.html(`
                            <button id="add-tube-row" class="btn btn-info add-tube-row">+</button>
                            <button id="remove-tube-row" class="btn btn-danger remove-row">-</button>
                        `);
                    } else {
                        var input = $('<input type="text" class="form-control">').val(cellValue);
                        td.append(input);
                    }
    
                    tr.append(td);
                });
                tbody.append(tr);
            });
        }
    }
    
    // Function to populate Tubes Table
    // function populateTubesTable(tubeData) {
    //     var tbody = $('#tubes-table-body');
    //     tbody.empty(); // Clear existing data

    //     if (!tubeData || tubeData.length === 0) {
    //         // tbody.append('<tr><td colspan="20" class="text-center">No Data</td></tr>');
    //         add_tubes_Row('tubes-table-body')
    //     } else {
    //         tubeData.forEach(function(row, rowIndex) {
    //             var tr = $('<tr></tr>');
    //             $('#tubes-table thead th').each(function(index, th) {
    //                 let header = $(th).text().trim();
    //                 let cellValue = row[header] || '';
    //                 var td = $('<td></td>');
    //                 // Check if the current column should be a dropdown
    //                 if (header === "Testing Required" || header === "Domestic Material") {
    //                     var select = $('<select class="form-control"></select>');
    //                     select.append($('<option value="">Select</option>'));
    //                     select.append($('<option value="true">True</option>'));
    //                     select.append($('<option value="false">False</option>'));
    //                     select.val(cellValue); // Set the value based on data
    //                     td.append(select);
    //                 }
    //                 else if( header === "Line"){
    //                     td.text(rowIndex + 1);
    //                 }
    //                 else if(header === "Edit/Delete"){
    //                     td.html(`
    //                        <button id="add-tube-row" class="btn btn-info add-tubs-row">+</button>
    //                        <button id="remove-tube-row" class="btn btn-danger remove-row">-</button>
    //                     `);
    //                 }
    //                 else {
    //                     var input = $('<input type="text" class="form-control">').val(cellValue);
    //                     td.append(input);
    //                 }

    //                 tr.append(td);

    //             });
    //             tbody.append(tr);
    //         });
    //     }
    // }

    // // Function to populate Tubes Table
    // function populateTubesTable(tubeData) {
    //     var tbody = $('#tubes-table-body');
    //     tbody.empty(); // Clear existing data

    //     if (!tubeData || tubeData.length === 0) {
    //         tbody.append('<tr><td colspan="19" class="text-center">No Data</td></tr>');
    //     } else {
    //         tubeData.forEach(function(row) {
    //             var tr = $('<tr></tr>');
    //             row.forEach(function(cell) {
    //                 var td = $('<td></td>');
    //                 var input = $('<input type="text" class="form-control">').val(cell);
    //                 td.append(input);
    //                 tr.append(td);
    //             });
    //             tbody.append(tr);
    //         });
    //     }
    // }

    function populateRingsTable(ring_value) {
        var tbody = $('#ring-table-body');
        tbody.empty(); // Clear existing data
    
        // Define a normalized mapping of lowercase keys to the table headers
        const headerMap = {
            "grade": "Grade",
            "color": "Color",
            "outer diameter": "Outer Diameter",
            "outer diameter + tolerance": "Outer Diameter + Tolerance",
            "outer diameter - tolerance": "Outer Diameter - Tolerance",
            "outer diameter unit of measure": "Outer Diameter Unit of Measure",
            "inner diameter": "Inner Diameter",
            "inner diameter + tolerance": "Inner Diameter + Tolerance",
            "inner diameter - tolerance": "Inner Diameter - Tolerance",
            "inner diameter unit of measure": "Inner Diameter Unit",
            "Thickness": "Thickness",
            "Thickness + tolerance": "Thickness + Tolerance",
            "Thickness - tolerance": "Thickness - Tolerance",
            "Thickness unit of measure": "Thickness Unit of Measure",
            "quantity": "Quantity",
            "quantity unit of measure": "Quantity Unit of Measure",
            "testing required": "Testing Required",
            "domestic material": "Domestic Material",
        };
    
        if (!ring_value || ring_value.length === 0) {
            add_ring_Row('ring-table-body');
        } else {
            ring_value.forEach(function(row, rowIndex) {
                var tr = $('<tr></tr>');
    
                // Iterate over headers to maintain order
                $('#ring-table thead th').each(function(index, th) {
                    let header = $(th).text().trim();
                    let cellValue;
    
                    // Check if the exact header text exists in row, if not normalize the key
                    if (row.hasOwnProperty(header)) {
                        cellValue = row[header] || ''; // Use the exact key if present
                    } else {
                        let normalizedKey = Object.keys(headerMap).find(key => headerMap[key] === header);
                        cellValue = normalizedKey ? row[normalizedKey] || '' : ''; // Use normalized key
                    }
    
                    var td = $('<td></td>');
    
                    // Check if the current column should be a dropdown
                    if (header === "Testing Required" || header === "Domestic Material") {
                        var select = $('<select class="form-control"></select>');
                        select.append($('<option value="">Select</option>'));
                        select.append($('<option value="true">True</option>'));
                        select.append($('<option value="false">False</option>'));
                        select.val(cellValue.toLowerCase()); // Set the value based on data
                        td.append(select);
                    } else if (header === "Line") {
                        td.text(rowIndex + 1);
                    } else if (header === "Edit/Delete") {
                        td.html(`
                            <button id="add-rings-row" class="btn btn-info add-ring-row">+</button>
                            <button id="remove-rings-row" class="btn btn-danger remove-row">-</button>
                        `);
                    } else {
                        var input = $('<input type="text" class="form-control">').val(cellValue);
                        td.append(input);
                    }
    
                    tr.append(td);
                });
                tbody.append(tr);
            });
        }
    }
    
    // Function to populate Rings Table
    // function populateRingsTable(ring_value) {
    //     var tbody = $('#ring-table-body');
    //     tbody.empty(); // Clear existing data

    //     if (!ring_value || ring_value.length === 0) {
    //         add_ring_Row('ring-table-body')
    //         // tbody.append('<tr><td colspan="20" class="text-center">No Data</td></tr>');
    //     } else {
    //         ring_value.forEach(function(row, rowIndex) {
    //             var tr = $('<tr></tr>');
    //             $('#ring-table thead th').each(function(index, th) {
    //                 let header = $(th).text().trim();
    //                 let cellValue = row[header] || '';
    //                 var td = $('<td></td>');
    //                 // Check if the current column is a dropdown list field
    //                 // Check if the current column should be a dropdown
    //                 if (header === "Testing Required" || header === "Domestic Material" || header === "Rolled and Molded") {
    //                     var select = $('<select class="form-control"></select>');
    //                     select.append($('<option value="">Select</option>'));
    //                     select.append($('<option value="true">True</option>'));
    //                     select.append($('<option value="false">False</option>'));
    //                     select.val(cellValue); // Set the value based on data
    //                     td.append(select);
    //                 }
    //                 else if( header === "Line"){
    //                     td.text(rowIndex + 1);
    //                 }
    //                 else if(header === "Edit/Delete"){
    //                     td.html(`
    //                         <button id="add-rings-row" class="btn btn-info add-ring-row">+</button>
    //                         <button id="remove-rings-row" class="btn btn-danger remove-row">-</button>
    //                     `);
    //                 }
    //                 else {
    //                     var input = $('<input type="text" class="form-control">').val(cellValue);
    //                     td.append(input);
    //                 }

    //                 tr.append(td);
    //             });
    //             tbody.append(tr);
    //         });
    //     }
    // }

    $('#add-sheet-row').click(function() {
        let rowCount_sheet = $('#sheets-table-body tr').length + 1;
        let newRow = `<tr>
            <td>${rowCount_sheet}</td>
            <td><input type="text" class="form-control" placeholder="Grade"></td>
            <td><input type="text" class="form-control" placeholder="Synonyms"></td>    
            <td><input type="text" class="form-control" placeholder="Color"></td>
            <td><input type="text" class="form-control" placeholder="Length"></td>
            <td><input type="text" class="form-control" placeholder="Length + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Width"></td>
            <td><input type="text" class="form-control" placeholder="Width + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Width - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Width Unit"></td>
            <td><input type="text" class="form-control" placeholder="Thickness"></td>
            <td><input type="text" class="form-control" placeholder="Thickness + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Thickness - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Thickness Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Number of Masked Sides"></td>
            <td><input type="text" class="form-control" placeholder="Number of Sanded Sides"></td>
            <td><input type="text" class="form-control" placeholder="Grain Direction"></td>
            <td><input type="text" class="form-control" placeholder="Quantity"></td>
            <td><input type="text" class="form-control" placeholder="Quantity Unit of Measure"></td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            </tr>`;

        // Append the new row to the Sheets table body
        $('#sheets-table-body').append(newRow);
    });

    // Function to remove the last row from the Sheets table
    $('#remove-sheet-row').click(function() {
        // if ($('#sheets-table-body tr').length > 1) {
            $('#sheets-table-body tr:last').remove();
        // } else {
        //     alert("At least one row must remain.");
        // }
    });

    // Repeat for Rods table
    $('#add-rods-row').click(function() {
        let rowCount_rods = $('#rods-table-body tr').length + 1;
        let newRow = `<tr>
            <td>${rowCount_rods}</td>
            <td><input type="text" class="form-control" placeholder="Grade"></td>
            <td><input type="text" class="form-control" placeholder="Synonyms"></td>    
            <td><input type="text" class="form-control" placeholder="Color"></td>
            <td><input type="text" class="form-control" placeholder="Diameter"></td>
            <td><input type="text" class="form-control" placeholder="Diameter + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Diameter - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Diameter Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Length"></td>
            <td><input type="text" class="form-control" placeholder="Length + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Quantity"></td>
            <td><input type="text" class="form-control" placeholder="Quantity Unit of Measure"></td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
        </tr>`;
        $('#rods-table-body').append(newRow);
    });

    $('#remove-rods-row').click(function() {
        // if ($('#rods-table-body tr').length > 1) {
            $('#rods-table-body tr:last').remove();
        // } else {
        //     alert("At least one row must remain.");
        // }
    });

    // Repeat for Tubes table
    $('#add-tubes-row').click(function() {
        let rowCount_tubes = $('#tubes-table-body tr').length + 1;
        let newRow = `<tr>
            <td>${rowCount_tubes}</td>
            <td><input type="text" class="form-control" placeholder="Grade"></td>
            <td><input type="text" class="form-control" placeholder="Synonyms"></td>    
            <td><input type="text" class="form-control" placeholder="Color"></td>
            <td><input type="text" class="form-control" placeholder="Outer Diameter"></td>
            <td><input type="text" class="form-control" placeholder="Outer Diameter + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Outer Diameter - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Outer Diameter Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Inner Diameter"></td>
            <td><input type="text" class="form-control" placeholder="Inner Diameter + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Inner Diameter - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Inner Diameter Unit"></td>
            <td><input type="text" class="form-control" placeholder="Length"></td>
            <td><input type="text" class="form-control" placeholder="Length + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Quantity"></td>
            <td><input type="text" class="form-control" placeholder="Quantity Unit of Measure"></td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
        </tr>`;
        $('#tubes-table-body').append(newRow);
    });

    $('#remove-tubes-row').click(function() {
        // if ($('#tubes-table-body tr').length > 1) {
            $('#tubes-table-body tr:last').remove();
        // } else {
        //     alert("At least one row must remain.");
        // }
    });

    // Repeat for Rings table
    // $('#add-rings-row').click(function() {
    //     let rowCount_rings = $('#ring-table-body tr').length + 1;
    //     let newRow = `<tr>
    //          <td>${rowCount_rings}</td>
    //         <td><input type="text" class="form-control" placeholder="Grade"></td>
    //         <td><input type="text" class="form-control" placeholder="Synonyms"></td>    
    //         <td><input type="text" class="form-control" placeholder="Color"></td>
    //         <td><input type="text" class="form-control" placeholder="Outer Diameter"></td>
    //         <td><input type="text" class="form-control" placeholder="Outer Diameter + Tolerance"></td>
    //         <td><input type="text" class="form-control" placeholder="Outer Diameter - Tolerance"></td>
    //         <td><input type="text" class="form-control" placeholder="Outer Diameter Unit of Measure"></td>
    //         <td><input type="text" class="form-control" placeholder="Inner Diameter"></td>
    //         <td><input type="text" class="form-control" placeholder="Inner Diameter + Tolerance"></td>
    //         <td><input type="text" class="form-control" placeholder="Inner Diameter - Tolerance"></td>
    //         <td><input type="text" class="form-control" placeholder="Inner Diameter Unit"></td>
    //         <td><input type="text" class="form-control" placeholder="Length"></td>
    //         <td><input type="text" class="form-control" placeholder="Length + Tolerance"></td>
    //         <td><input type="text" class="form-control" placeholder="Length - Tolerance"></td>
    //         <td><input type="text" class="form-control" placeholder="Length Unit of Measure"></td>
    //         <td><input type="text" class="form-control" placeholder="Quantity"></td>
    //         <td><input type="text" class="form-control" placeholder="Quantity Unit of Measure"></td>
    //         <td>
    //             <select class="form-control">
    //                 <option value="select" selected>select</option>
    //                 <option value="true">True</option>
    //                 <option value="false">False</option>
    //             </select>
    //         </td>
    //         <td>
    //             <select class="form-control">
    //                 <option value="select" selected>select</option>
    //                 <option value="true">True</option>
    //                 <option value="false">False</option>
    //             </select>
    //         </td>
    //     </tr>`;
    //     $('#ring-table-body').append(newRow);
    // });

    $('#remove-rings-row').click(function() {
        // if ($('#ring-table-body tr').length > 1) {
            $('#ring-table-body tr:last').remove();
        // } else {
        //     alert("At least one row must remain.");
        // }
    });

    function add_sheets_Row(tableBodyId, rowData) {
        const $tbody = $(`#${tableBodyId}`);
        const rowCount_sheet = $tbody.find('tr').length + 1;
        const newRow = `<tr>
            <td>${rowCount_sheet}</td>
            <td><input type="text" class="form-control" placeholder="Grade"></td>
            <td><input type="text" class="form-control" placeholder="Synonyms"></td>    
            <td><input type="text" class="form-control" placeholder="Color"></td>
            <td><input type="text" class="form-control" placeholder="Length"></td>
            <td><input type="text" class="form-control" placeholder="Length + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Width"></td>
            <td><input type="text" class="form-control" placeholder="Width + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Width - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Width Unit"></td>
            <td><input type="text" class="form-control" placeholder="Thickness"></td>
            <td><input type="text" class="form-control" placeholder="Thickness + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Thickness - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Thickness Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Number of Masked Sides"></td>
            <td><input type="text" class="form-control" placeholder="Number of Sanded Sides"></td>
            <td><input type="text" class="form-control" placeholder="Grain Direction"></td>
            <td><input type="text" class="form-control" placeholder="Quantity"></td>
            <td><input type="text" class="form-control" placeholder="Quantity Unit of Measure"></td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <button class="btn btn-info add-sheet-row">+</button>
                <button class="btn btn-danger remove-row">-</button>
            </td>
        </tr>`;

        // Append new row to the table body
        $tbody.append(newRow);
    }

    // Function to remove a row
    function removeRow(row) {
        // if ($(row).closest('tbody').find('tr').length > 1) {
            $(row).closest('tr').remove();
        // } else {
        //     alert("At least one row must remain.");
        // }
    }

    function add_rods_Row(tableBodyId, rowData) {
        const $tbody = $(`#${tableBodyId}`);
        const rowCount_rods = $tbody.find('tr').length + 1;
        const newRow = `<tr>
            <td>${rowCount_rods}</td>
            <td><input type="text" class="form-control" placeholder="Grade"></td>
            <td><input type="text" class="form-control" placeholder="Synonyms"></td>    
            <td><input type="text" class="form-control" placeholder="Color"></td>
            <td><input type="text" class="form-control" placeholder="Diameter"></td>
            <td><input type="text" class="form-control" placeholder="Diameter + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Diameter - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Diameter Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Length"></td>
            <td><input type="text" class="form-control" placeholder="Length + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Quantity"></td>
            <td><input type="text" class="form-control" placeholder="Quantity Unit of Measure"></td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <button class="btn btn-info add-rods-row">+</button>
                <button class="btn btn-danger remove-row">-</button>
            </td>
        </tr>`;

        // Append new row to the table body
        $tbody.append(newRow);
    }

    function add_tubes_Row(tableBodyId, rowData){
        const $tbody = $(`#${tableBodyId}`);
        const rowCount_tubes = $tbody.find('tr').length + 1;
        const newRow = `<tr>
            <td>${rowCount_tubes}</td>
            <td><input type="text" class="form-control" placeholder="Grade"></td>
            <td><input type="text" class="form-control" placeholder="Synonyms"></td>    
            <td><input type="text" class="form-control" placeholder="Color"></td>
            <td><input type="text" class="form-control" placeholder="Outer Diameter"></td>
            <td><input type="text" class="form-control" placeholder="Outer Diameter + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Outer Diameter - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Outer Diameter Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Inner Diameter"></td>
            <td><input type="text" class="form-control" placeholder="Inner Diameter + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Inner Diameter - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Inner Diameter Unit"></td>
            <td><input type="text" class="form-control" placeholder="Length"></td>
            <td><input type="text" class="form-control" placeholder="Length + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Quantity"></td>
            <td><input type="text" class="form-control" placeholder="Quantity Unit of Measure"></td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <button class="btn btn-info add-tubs-row">+</button>
                <button class="btn btn-danger remove-row">-</button>
            </td>
        </tr>`;

        // Append new row to the table body
        $tbody.append(newRow);
    }

    function add_ring_Row(tableBodyId, rowData){
        const $tbody = $(`#${tableBodyId}`);
        const rowCount_rings = $tbody.find('tr').length + 1;
        const newRow = `<tr>
            <td>${rowCount_rings}</td>
            <td><input type="text" class="form-control" placeholder="Grade"></td>
            <td><input type="text" class="form-control" placeholder="Synonyms"></td>    
            <td><input type="text" class="form-control" placeholder="Color"></td>
            <td><input type="text" class="form-control" placeholder="Outer Diameter"></td>
            <td><input type="text" class="form-control" placeholder="Outer Diameter + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Outer Diameter - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Outer Diameter Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Inner Diameter"></td>
            <td><input type="text" class="form-control" placeholder="Inner Diameter + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Inner Diameter - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Inner Diameter Unit"></td>
            <td><input type="text" class="form-control" placeholder="Length"></td>
            <td><input type="text" class="form-control" placeholder="Length + Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length - Tolerance"></td>
            <td><input type="text" class="form-control" placeholder="Length Unit of Measure"></td>
            <td><input type="text" class="form-control" placeholder="Quantity"></td>
            <td><input type="text" class="form-control" placeholder="Quantity Unit of Measure"></td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <select class="form-control">
                    <option value="select" selected>select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </td>
            <td>
                <button class="btn btn-info add-ring-row">+</button>
                <button class="btn btn-danger remove-row">-</button>
            </td>
        </tr>`;

        // Append new row to the table body
        $tbody.append(newRow);
    }

    // Event delegation for dynamic "Add" and "Remove" button actions
    $(document).on('click', '.add-sheet-row', function() {
        add_sheets_Row('sheets-table-body');  // Call the addRow function for the sheets table
    });

    $(document).on('click', '.remove-row', function() {
        removeRow(this);  // Call the removeRow function for the clicked row
    });

    $(document).on('click', '.add-rods-row', function() {
        add_rods_Row('rods-table-body');  // Call the addRow function for the rods table
    });

    $(document).on('click', '.add-tubs-row', function() {
        add_tubes_Row('tubes-table-body');  // Call the addRow function for the tubes table
    });
    $(document).on('click', '.add-ring-row', function() {
        add_ring_Row('ring-table-body');  // Call the addRow function for the ring table
    });
    let showSuccessAlert = true;
    let showFailureAlert = true

    // $('#save-changes').click(function() {
    //     // showLoader(); // Show loader during save operation

    //     // Collect data from tables
    //     // let emailContent = $('#email-content').text();
    //     let emailContent = originalData.email_data
    //     let aiResponse = $('#ai-response').text();

    //     let sheetData = [];
    //     $('#sheets-table-body tr').each(function() {
    //         let row = {};
    //         let skipRow = false;
    //         $(this).find('td').each(function(index) {
    //             let header = $('#sheets-table thead th').eq(index).text().trim();
    //             let value = $(this).find('input').val();
    //             let option = $(this).find(":selected").text();
    //             if (header) {
    //                 if (header === "Grade" && value === "") {
    //                     skipRow = true; // Set flag to skip row
    //                     return false;
    //                 }
    //                 row[header] = value;
    //                 if (option){
    //                     if (option == "Select"){
    //                         option="";
    //                         row[header] = option;
    //                     }
    //                     else{
    //                         row[header] = option;
    //                     }
    //                 }
    //             }
    //         });
    //         if (!skipRow && Object.keys(row).length > 0) {
    //             sheetData.push(row);
    //         }
    //         // if (Object.keys(row).length > 0) {
    //         //     sheetData.push(row);
    //         // }
    //     });

    //     let rodData = [];
    //     $('#rods-table-body tr').each(function() {
    //         let row = {};
    //         let skipRow = false;
    //         $(this).find('td').each(function(index) {
    //             let header = $('#rods-table thead th').eq(index).text().trim();
    //             let value = $(this).find('input').val();
    //             let option = $(this).find(":selected").text();
    //             if (header) {
    //                 if (header === "Grade" && value === "") {
    //                     skipRow = true; // Set flag to skip row
    //                     return false;
    //                 }
    //                 row[header] = value;
    //                 if (option){
    //                     if (option == "Select"){
    //                         option="";
    //                         row[header] = option;
    //                     }
    //                     else{
    //                         row[header] = option;
    //                     }
    //                 }
    //             }
    //         });
    //         if (!skipRow && Object.keys(row).length > 0) {
    //             rodData.push(row);
    //         }
    //         // if (Object.keys(row).length > 0) {
    //         //     rodData.push(row);
    //         // }
    //     });

    //     let tubeData = [];
    //     $('#tubes-table-body tr').each(function() {
    //         let row = {};
    //         let skipRow = false;
    //         $(this).find('td').each(function(index) {
    //             let header = $('#tubes-table thead th').eq(index).text().trim();
    //             let value = $(this).find('input').val();
    //             let option = $(this).find(":selected").text();
    //             if (header) {
    //                 if (header === "Grade" && value === "") {
    //                     skipRow = true;
    //                     return false; // Skip appending this field if Grade is empty
    //                 }
    //                 row[header] = value;
    //                 if (option){
    //                     if (option == "Select"){
    //                         option="";
    //                         row[header] = option;
    //                     }
    //                     else{
    //                         row[header] = option;
    //                     }
    //                 }
    //             }
    //         });
    //         if (!skipRow && Object.keys(row).length > 0) {
    //             tubeData.push(row);
    //         }
    //         // if (Object.keys(row).length > 0) {
    //         //     tubeData.push(row);
    //         // }
    //     });

    //     let ringData = [];
    //     $('#ring-table-body tr').each(function() {
    //         let row = {};
    //         let skipRow = false;
    //         $(this).find('td').each(function(index) {
    //             let header = $('#ring-table thead th').eq(index).text().trim();
    //             let value = $(this).find('input').val();
    //             let option = $(this).find(":selected").text();

    //             console.log("Rings data: " + header)
    //             console.log(option)
    //             // var option = $("<option />");
    //             if (header) {
    //                 if (header === "Grade" && value === "") {
    //                     skipRow = true;
    //                     return false; // Skip appending this field if Grade is empty
    //                 }
    //                 row[header] = value;
    //                 if (option){
    //                     if (option == "Select"){
    //                         option="";
    //                         row[header] = option;
    //                     }
    //                     else{
    //                         row[header] = option;
    //                     }
    //                 }
    //             }
    //         });
    //         if (!skipRow && Object.keys(row).length > 0) {
    //             ringData.push(row);
    //         }
    //         // if (Object.keys(row).length > 0) {
    //         //     ringData.push(row);
    //         // }
    //     });
    //     // Create JSON object
    //     if (aiResponse == ""){
    //         aiResponse = aiResponse
    //     }
    //     else{
    //         aiResponse = JSON.parse(aiResponse)
    //     }
    //     let updatedData = {
    //         email_data: {
    //             from_address: emailContent.from_address,
    //             to_address: emailContent.to_address,
    //             date: emailContent.date,
    //             subject: emailContent.subject,
    //             body: emailContent.body
    //         },
    //         AI_Response: aiResponse,
    //         sheet_value: sheetData,
    //         rod_value: rodData,
    //         tube_value: tubeData,
    //         ring_value: ringData
    //     };
    //     console.log('Updated Data to Save:', updatedData); // Debug

    //     // Assume 'currentFileName' holds the original file name without the .json extension
    //     let currentFileName = originalFilename.replace('.eml', '').replaceAll(" ", "_").replaceAll("#","");

    //     // Send updated data to the backend
    //     $.ajax({
    //         url: `/save_data?filename=${currentFileName}`, // Pass the filename as a query parameter
    //         type: 'POST',
    //         contentType: 'application/json',
    //         data: JSON.stringify(updatedData),
    //         success: function(response) {
    //             if (showSuccessAlert) {
    //                 alert(response.message); // Notify user about success
    //             }
    //             hideLoader(); // Hide loader after success
    //             showSuccessAlert = true;
    //         },
    //         error: function(err) {
    //             if (showFailureAlert){
    //                 console.error('Error:', err);
    //                 alert('Failed to save changes.');
    //             }
    //             showFailureAlert = true
    //             hideLoader(); // Hide loader on error
    //         }
    //     });
    // });

    // Function to add a single synonym for a grade
    
    function addSynonym(grade, synonym) {
        $.ajax({
            url: '/add_synonym',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ grade: grade, synonym: synonym }),
            success: function(response) {
                // Optionally handle success (e.g., update UI if necessary)
            },
            error: function(error) {
                console.error('Error:', error);
                alert('Failed to add synonym');
            }
        });
    }

    // Save Changes Button Click Handler
    $('#save-changes').click(function() {
        let sheetData = [];
        let rodData = [];
        let tubeData = [];
        let ringData = [];
    
        const uniqueSynonyms = new Set(); // Set to store unique grade-synonym pairs
    
        // Function to process each row for synonyms and row data
        function processRow($tableBody, dataArray, tableName) {
            $tableBody.find('tr').each(function() {
                let row = {};
                let skipRow = false;
    
                let gradeInput = $(this).find('td:eq(1) input');  // Grade input (2nd column)
                let synonymInput = $(this).find('td:eq(2) input'); // Synonym input (3rd column)
                
                let grade = gradeInput.length ? gradeInput.val().trim() : "";
                let synonym = synonymInput.length ? synonymInput.val().trim() : "";
    
                // Only add to uniqueSynonyms if both grade and synonym are provided
                if ((grade && synonym) || grade) {
                    uniqueSynonyms.add(`${grade}::${synonym}`);
                }
                // Iterate through each cell in the row to collect other data
                $(this).find('td').each(function(index) {
                    let header = $(`#${tableName} thead th`).eq(index).text().trim();
                    let value = $(this).find('input').val();
                    let option = $(this).find(":selected").text();
                    
                    if (header) {
                        if (header === "Synonyms(optional)") {
                            return; 
                        }
                        if (header === "Grade" && value === "") {
                            skipRow = true; // Skip the row if Grade is empty
                            return false;
                        }
                        row[header] = value;
                        if (option) {
                            row[header] = option === "Select" ? "" : option;
                        }
                    }
                });
                
                // Add row data to the specified data array if not skipping the row
                if (!skipRow && Object.keys(row).length > 0) {
                    dataArray.push(row);
                }
            });
        }
    
        // Process each table and add the rows to respective data arrays
        processRow($('#sheets-table-body'), sheetData, 'sheets-table');
        processRow($('#rods-table-body'), rodData, 'rods-table');
        processRow($('#tubes-table-body'), tubeData, 'tubes-table');
        processRow($('#ring-table-body'), ringData, 'ring-table');
    
        // After collecting all rows, send each unique synonym to the backend
        uniqueSynonyms.forEach(item => {
            const [grade, synonym] = item.split("::");
            addSynonym(grade, synonym); // Call addSynonym only once per unique entry
        });
    
        // Continue with your existing logic to send the full data to the backend
        let emailContent = originalData.email_data;
        let aiResponse = $('#ai-response').text() ? JSON.parse($('#ai-response').text()) : {};
        let updatedData = {
            email_data: {
                from_address: emailContent.from_address,
                to_address: emailContent.to_address,
                date: emailContent.date,
                subject: emailContent.subject,
                body: emailContent.body
            },
            AI_Response: aiResponse,
            sheet_value: sheetData,
            rod_value: rodData,
            tube_value: tubeData,
            ring_value: ringData
        };
        let currentFileName = originalFilename.replace('.eml', '').replaceAll(" ", "_").replaceAll("#","");
        console.log("currentFileName: " + currentFileName)
        
        if(currentFileName==="" || currentFileName.endsWith(".json")){
            if (localStorage.getItem("file_name")){
                currentFileName = localStorage.getItem("file_name").replace('.json', '').replaceAll("\"", "");
            }
        }
        if (currentFileName !="" && currentFileName!="undefined" && emailContent!={} && (sheetData.length!=0 || rodData.length !=0 || tubeData.length != 0 || ringData.length!=0)){
            // Send updated data to the backend
            $.ajax({
                url: `/save_data?filename=${currentFileName}`, // Pass the filename as a query parameter
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(updatedData),
                success: function(response) {
                    if (showSuccessAlert) {
                        alert(response.message); // Notify user about success
                    }
                    hideLoader(); // Hide loader after success
                    showSuccessAlert = true;
                },
                error: function(err) {
                    if (showFailureAlert){
                        console.error('Error:', err);
                        alert('Failed to save changes.');
                    }
                    showFailureAlert = true
                    hideLoader(); // Hide loader on error
                }
            });
        }
        else{
            if (showSuccessAlert){
                alert('Please process a file before saving');
            }
        }
    });
    
    

    // Download JSON Button Click Handler
    $('#download-json').click(function() {
        // Collect data from tables
        // let aiResponse = $('#ai-response').text();
        let aiResponse = $('#ai-response').text() ? JSON.parse($('#ai-response').text()) : {};
        // let emailContent = $('#email-content').text();
        let emailContent =  originalData.email_data

        let sheetData = [];
        $('#sheets-table-body tr').each(function() {
            let row = {};
            let skipRow = false;
            $(this).find('td').each(function(index) {
                let header = $('#sheets-table thead th').eq(index).text().trim();
                let value = $(this).find('input').val();
                let option = $(this).find(":selected").text();
                if (header) {
                    if (header === "Grade" && value === "") {
                        skipRow = true; // Set flag to skip row
                        return false;
                    }
                    row[header] = value;
                    if (option){
                        if (option == "Select"){
                            option="";
                            row[header] = option;
                        }
                        else{
                            row[header] = option;
                        }
                    }
                }
            });
            if (!skipRow && Object.keys(row).length > 0) {
                sheetData.push(row);
            }
            // if (Object.keys(row).length > 0) {
            //     sheetData.push(row);
            // }
        });

        let rodData = [];
        $('#rods-table-body tr').each(function() {
            let row = {};
            let skipRow = false;
            $(this).find('td').each(function(index) {
                let header = $('#rods-table thead th').eq(index).text().trim();
                let value = $(this).find('input').val();
                let option = $(this).find(":selected").text();
                if (header) {
                    if (header === "Grade" && value === "") {
                        skipRow = true; // Set flag to skip row
                        return false;
                    }
                    row[header] = value;
                    if (option){
                        if (option == "Select"){
                            option="";
                            row[header] = option;
                        }
                        else{
                            row[header] = option;
                        }
                    }
                }
            });
            if (!skipRow && Object.keys(row).length > 0) {
                rodData.push(row);
            }
            // if (Object.keys(row).length > 0) {
            //     rodData.push(row);
            // }
        });

        let tubeData = [];
        $('#tubes-table-body tr').each(function() {
            let row = {};
            let skipRow = false;
            $(this).find('td').each(function(index) {
                let header = $('#tubes-table thead th').eq(index).text().trim();
                let value = $(this).find('input').val();
                let option = $(this).find(":selected").text();
                if (header) {
                    if (header === "Grade" && value === "") {
                        skipRow = true;
                        return false; // Skip appending this field if Grade is empty
                    }
                    row[header] = value;
                    if (option){
                        if (option == "Select"){
                            option="";
                            row[header] = option;
                        }
                        else{
                            row[header] = option;
                        }
                    }
                }
            });
            if (!skipRow && Object.keys(row).length > 0) {
                tubeData.push(row);
            }
            // if (Object.keys(row).length > 0) {
            //     tubeData.push(row);
            // }
        });

        let ringData = [];
        $('#ring-table-body tr').each(function() {
            let row = {};
            let skipRow = false;
            $(this).find('td').each(function(index) {
                let header = $('#ring-table thead th').eq(index).text().trim();
                let value = $(this).find('input').val();
                let option = $(this).find(":selected").text();
                
                // var option = $("<option />");
                if (header) {
                    if (header === "Grade" && value === "") {
                        skipRow = true;
                        return false; // Skip appending this field if Grade is empty
                    }
                    row[header] = value;
                    if (option){
                        if (option == "Select"){
                            option="";
                            row[header] = option;
                        }
                        else{
                            row[header] = option;
                        }
                    }
                }
            });
            if (!skipRow && Object.keys(row).length > 0) {
                ringData.push(row);
            }
            // if (Object.keys(row).length > 0) {
            //     ringData.push(row);
            // }
        });

        // Create JSON object
        let jsonData = {
            AI_Response: aiResponse,
            email_data: {
                from_address: emailContent.from_address,
                to_address: emailContent.to_address,
                date: emailContent.date,
                subject: emailContent.subject,
                body: emailContent.body
            },
            sheet_value: sheetData,
            rod_value: rodData,
            tube_value: tubeData,
            ring_value: ringData
        };
        // console.log('JSON Data to Download:', jsonData); // Debug
        // Convert JSON object to string
        let jsonStr = JSON.stringify(jsonData, null, 2);
        let blob = new Blob([jsonStr], { type: "application/json" });

        let currentFileName = originalFilename.replace('.eml', '').replaceAll(" ", "_").replaceAll("#",""); // Assume this variable stores the original filename
        if(currentFileName==="" || currentFileName.endsWith(".json")){
            currentFileName = currentFileName.replace('.json', '').replaceAll("\"", "");
        }
        if (currentFileName !="" && currentFileName!="undefined" && emailContent!={} && (sheetData.length!=0 || rodData.length !=0 || tubeData.length != 0 || ringData.length!=0)){

            let url = URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = `${currentFileName}.json`; // Save the file with the original filename
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        else{
            alert('Please process a file before downloading');
        }
    });

    $('#finetune-json').click(function() {
        showSuccessAlert = false;
        showFailureAlert = false;
        
        // Avoid multiple clicks by disabling the button temporarily
        $(this).prop('disabled', true);
        if ( document.getElementById("finetune-json").innerText=="Back"){
            document.getElementById('index_page').style.display = 'none';
            show_Files();
            document.getElementById('fileDiv').style.display = 'block';
        }
        else{
            $('#save-changes').trigger('click');
            // $(document).ajaxComplete(function(event, xhr, settings) {
            //     if (settings.url.includes('/save_data')) {
                    $.ajax({
                        url: `/file_operations`,
                        type: 'GET',
                        success: function(response) {
                            if (response.files) {
                                localStorage.setItem("fileList", JSON.stringify(response.files));
                                // window.location.href = '/file_list';  // Redirect to file list page
                                document.getElementById('index_page').style.display = 'none';
                                show_Files()
                                document.getElementById('fileDiv').style.display = 'block';
                            } else {
                                alert('Failed to retrieve file list.');
                            }
                            hideLoader();
                        },
                        error: function(err) {
                            console.error('Error:', err);
                            alert('Failed to retrieve files.');
                            hideLoader();
                        }
                    });
                // }
            //     });
            }
            // Re-enable the Fine Tune button
            $('#finetune-json').prop('disabled', false);
    });

    function show_Files() {
        const fileList = JSON.parse(localStorage.getItem("fileList"));
        const fileListContainer = document.getElementById("file-list");
        const fileCounter = document.getElementById("file-counter");
        const actionButton = document.getElementById("Perform-finetuning");
        const datasetButton = document.getElementById("back");
        
        fileListContainer.innerHTML = '';

        if (fileList && fileList.length > 0 && fileListContainer && fileCounter && actionButton && datasetButton) {
            // Display each file as a button
            fileList.forEach(file => {
                const fileButton = document.createElement("button");
                // fileButton.className = "btn btn-info col-12 col-md-5 mx-1 my-1";
                fileButton.className = "btn btn-info text-center w-100 mb-2";
                fileButton.textContent = file;
                
                // fileButton.onclick = () => fetchProcessedData(file.replace(".json", ""), "downloaded_JSON_files", true);
                fileButton.addEventListener('click', function () {
                    fetchProcessedData(file.replace(".json", ""), "downloaded_JSON_files", true);
                    showSuccessAlert = true;
                    showFailureAlert = true;
                });
                
                fileListContainer.appendChild(fileButton);
            });
            
            // Display number of files and show buttons
            fileCounter.textContent = `Number of files: ${fileList.length}`;
            actionButton.style.display = "block";
            datasetButton.style.display = "block";
        } else if (!fileListContainer) {
            console.error("Element with id 'file-list' not found.");
        } else {
            fileListContainer.innerHTML = "<p class='text-danger'>No files found</p>";
            document.getElementById('back').style.display = 'block';
        }
    }

    
    $('#Perform-finetuning').click(function() {
        // Step 1: Create and download the dataset
        $.ajax({
            url: '/file_operations',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ start_fine_tuning: false }), // Only create dataset, do not fine-tune
            success: function(response) {
                if (response.data) {
    
                    // Helper function to order keys
                    function orderKeys(item) {
                        return {
                            messages: item.messages.map(message => ({
                                role: message.role,
                                content: message.content
                            }))
                        };
                    }
    
                    // Apply the order function to each item in response.data
                    let jsonlStr = response.data.map(item => JSON.stringify(orderKeys(item))).join('\n');
                    let file_name = response.file_name;
                    let blob = new Blob([jsonlStr], { type: "application/json" });
                    
                    // Create download link
                    let url = URL.createObjectURL(blob);
                    let a = document.createElement('a');
                    a.href = url;
                    a.download = `${file_name}`; // Download as .jsonl file
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url); // Clean up
                    
                    alert('Dataset created and file downloaded successfully!');
                    
                    // Step 2: Ask the user if they want to start the fine-tuning process
                    const shouldFineTune = confirm("Do you want to fine-tune the model?");
                    if (shouldFineTune) {
                        // If user confirms, send a new request to start fine-tuning
                        $.ajax({
                            url: '/file_operations',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify({ start_fine_tuning: true }), // Start fine-tuning
                            success: function(response) {
                                if (response.job_id) {
                                    alert(`Fine-tuning started with Job ID: ${response.job_id}. Status: ${response.status.status}`);
                                } else if (response.error) {
                                    alert(`Error: ${response.error}`);
                                } else {
                                    alert('Failed to start the fine-tuning process.');
                                }
                            },
                            error: function(err) {
                                console.error('Error:', err);
                                alert('Failed to start fine-tuning.');
                            }
                        });
                    }
                } else if (response.error) {
                    alert(`Error: ${response.error}`);
                } else {
                    alert('Failed to create the dataset.');
                }
            },
            error: function(err) {
                console.error('Error:', err);
                alert('Failed to process files.');
            }
        });
    });
    
    $('#synonyms_ui').click(function() {
        window.location.href = '/synonyms_mapping';
    });

    $('#back').click(function(){
        window.location.href = '/'; 
    });
});
