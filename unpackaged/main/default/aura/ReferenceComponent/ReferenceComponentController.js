({
	doInit : function(component, event, helper) {
		// This is url query parameter
  		var referenceId = helper.getParameterByName(component , event, helper, 'referenceId');
        console.log('referenceId'+referenceId);
        component.set('v.referenceId', referenceId);
        
        if (referenceId) {
            //show spinner as true
            component.set('v.showSpinner', true);
            
        	var action = component.get("c.fetchSpecificReference");
            action.setParams({  referenceId : component.get('v.referenceId')  });
    
            // Create a callback that is executed after 
            // the server-side action returns
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    component.set('v.reference', response.getReturnValue());
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
                    
                    helper.showToast(component, event, 'error', 'Something Went Wrong. Please try after some time.');
                }
                
                //show spinner as false
            	component.set('v.showSpinner', false);
            });
            $A.enqueueAction(action);    
        }
	},
    
    handleSubmitReferences : function(component, event, helper) {
        if (component.get('v.reference.Candidate_Review__c')) {
            helper.submitReference(component);
            
        } else {
            helper.showToast(component, event, 'error', 'Please fill the required fields and then try again.');
        }
        
    }
})