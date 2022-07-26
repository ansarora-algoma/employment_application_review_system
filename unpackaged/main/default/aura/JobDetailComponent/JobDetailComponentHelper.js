({
    MAX_FILE_SIZE: 4500000, //Max file size 4.5 MB 
    CHUNK_SIZE: 750000,      //Chunk Max size 750Kb
    
    handleFileUpload : function(component, event, helper, fileName) {
    	
        if (event.getSource().get("v.files").length > 0) {
            if (event.getSource().get("v.files")[0].size > this.MAX_FILE_SIZE) {
                var fileErrorMessage = 'File size cannot exceed ' + self.MAX_FILE_SIZE + ' bytes.\n';
                this.showToast(component, event, 'error', fileErrorMessage);
                return;
            }
            fileName = event.getSource().get("v.files")[0]['name'];
        }
        component.set("v.fileName", fileName);
    },
    
	showToast : function(component, event, type, message) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "type": type,
            "message": message
        });
        toastEvent.fire();
    },
    
    applicationSubmit : function(component, event, helper) {
        
        var action = component.get("c.applicationSubmit");
        action.setParams({  jobId : component.get('v.jobId'), candidate : JSON.stringify(component.get('v.candidate'))  });

        // Create a callback that is executed after 
        // the server-side action returns
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                
                //check if file is uploaded
                if (component.find("fuploader").get("v.files") && component.find("fuploader").get("v.files").length  > 0) {
                    component.set('v.showSpinner', true);
                    this.readFiles(component, component.find("fuploader").get("v.files")[0], response.getReturnValue());
                
                } else {
                    component.set('v.showSpinner', true);
                	this.showToast(component, event, 'success', 'Your Application has been successfully submitted. We will review and contact you soon!');
                    this.completeApplicationSubmit(component, event);
                }
            }
            else if (state === "INCOMPLETE") {
                // do something
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + 
                                 errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
                
                this.showToast(component, event, 'error', 'Something went wrong');
            }
            
            //set spinner to false
            component.set('v.showSpinner', false);
        });
		$A.enqueueAction(action);
    },
    
    getParameterByName: function(component, event, helper, name) {
          name = name.replace(/[\[\]]/g, "\\$&");
          var url = window.location.href;
          var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
          var results = regex.exec(url);
          if (!results) return null;
          if (!results[2]) return '';
          return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    
    completeApplicationSubmit : function(component, event) {
        component.set('v.showSpinner', false);
        //redirect to the job page
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
        	"url": "/s"
        });
        urlEvent.fire();
    },
    
    readFiles : function(component, file, recordId) {
        var self = this;
        
        // create a FileReader object 
        var objFileReader = new FileReader();
        // set onload function of FileReader object   
        objFileReader.onload = $A.getCallback(function() {
            var fileContents = objFileReader.result;
            var base64 = 'base64,';
            var dataStart = fileContents.indexOf(base64) + base64.length;
             
            fileContents = fileContents.substring(dataStart);
            // call the uploadProcess method 
            self.uploadProcess(component, file, fileContents, recordId);
        });
         
        objFileReader.readAsDataURL(file);
    },
     
    uploadProcess: function(component, file, fileContents, recordId) {
        // set a default size or startpostiton as 0 
        var startPosition = 0;
        // calculate the end size or endPostion using Math.min() function which is return the min. value   
        var endPosition = Math.min(fileContents.length, startPosition + this.CHUNK_SIZE);
         
        // start with the initial chunk, and set the attachId(last parameter)is null in begin
        this.uploadInChunk(component, file, fileContents, startPosition, endPosition, null, recordId);
    },
    
    uploadInChunk: function(component, file, fileContents, startPosition, endPosition, attachId, recordId) {
        // call the apex method 'SaveFile'
        var getchunk = fileContents.substring(startPosition, endPosition);
        var action = component.get("c.SaveFile");
        action.setParams({
            parentId: recordId,
            fileName: file.name,
            base64Data: encodeURIComponent(getchunk),
            contentType: file.type,
            fileId: attachId
        });
         
        // set call back 
        action.setCallback(this, function(response) {
            // store the response / Attachment Id   
            attachId = response.getReturnValue();
            var state = response.getState();
            if (state === "SUCCESS") {
                // update the start position with end postion
                startPosition = endPosition;
                endPosition = Math.min(fileContents.length, startPosition + this.CHUNK_SIZE);
                // check if the start postion is still less then end postion 
                // then call again 'uploadInChunk' method , 
                // else, diaply alert msg and hide the loading spinner
                if (startPosition < endPosition) {
                    this.uploadInChunk(component, file, fileContents, startPosition, endPosition, attachId);
                } else {
                    this.showToast(component, event, 'success', 'Your Application has been successfully submitted. We will review and contact you soon!');
                	this.completeApplicationSubmit(component, event);
                }
                // handle the response errors        
            } else if (state === "INCOMPLETE") {
                alert("From server: " + response.getReturnValue());
                this.showToast(component, event, 'error', 'Your Application has been submitted but Resume upload failed.');
                this.completeApplicationSubmit(component, event);
                
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
                this.showToast(component, event, 'error', 'Your Application has been submitted but Resume upload failed.');
                this.completeApplicationSubmit(component, event);
            }
        });
        // enqueue the action
        $A.enqueueAction(action);
    }
})