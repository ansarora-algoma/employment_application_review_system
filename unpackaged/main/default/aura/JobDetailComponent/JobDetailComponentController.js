({
	/*hideSpinner : function (component, event, helper) {
        var spinner = component.find('spinner');
        var evt = spinner.get("e.toggle");
        evt.setParams({ isVisible : false });
        evt.fire();    
    },
    */
    init : function (component, event, helper) {
        // This is url query parameter
  		var jobId = helper.getParameterByName(component , event, helper, 'jobId');
        component.set('v.jobId', jobId);
        
        if (jobId) {
            component.set('v.showSpinner', true);
        	var action = component.get("c.fetchSpecificJob");
            action.setParams({  jobId : component.get('v.jobId')  });
    
            // Create a callback that is executed after 
            // the server-side action returns
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    component.set('v.jobApplication', response.getReturnValue());
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
                }
                
                component.set('v.showSpinner', false);
            });
            $A.enqueueAction(action);    
        }
    },
    
    handleApplyJob: function (component, event, helper) {
        component.set('v.showJobDetail', false);
    },
    
    handleSubmitApplication: function(component, event, helper) {
        
        var allValid = component.find('fieldId').reduce(function (validSoFar, inputCmp) {
                inputCmp.showHelpMessageIfInvalid();
                return validSoFar && inputCmp.get('v.validity').valid;//.valueMissing;
             }, true);
             if (allValid) {
                 //submit if all valid
                 //adding on 5/13
        		 //check if file is uploaded or not
                 if (component.find("fuploader").get("v.files") && component.find("fuploader").get("v.files").length  > 0) {
                     //show spinner
                     component.set('v.showSpinner', true);
                     
                     helper.applicationSubmit(component, event, helper);
                 } else {
                     helper.showToast(component, event, 'error', 'Please Attach your Resume and then try again.');
                 }
                 
             } else {
                 helper.showToast(component, event, 'error', 'Please fill the required fields and then try again.');
        	}
    },
    
    handleJobRedirect: function(component, event, helper) {
        //redirect to the job page
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
          "url": "/s/jobdetail?jobId="+component.get('v.jobId')
        });
        urlEvent.fire();
    },
    
    handleFilesChange: function(component, event, helper) {
        var fileName = 'No File Selected..';
        helper.handleFileUpload(component, event, helper, fileName);
    }

})