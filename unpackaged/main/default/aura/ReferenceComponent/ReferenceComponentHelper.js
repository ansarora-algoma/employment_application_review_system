({
	getParameterByName: function(component, event, helper, name) {
          name = name.replace(/[\[\]]/g, "\\$&");
          var url = window.location.href;
          var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
          var results = regex.exec(url);
          if (!results) return null;
          if (!results[2]) return '';
          return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    
    showToast : function(component, event, type, message) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "type": type,
            "message": message
        });
        toastEvent.fire();
    },
    
    submitReference: function(component) {
        //show spinner as true
        component.set('v.showSpinner', true);
        
        var action = component.get("c.submitReference");
        action.setParams({  reference : component.get('v.reference')  });
        
        // Create a callback that is executed after 
        // the server-side action returns
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                //success
                this.showToast(component, event, 'success', 'Thank you so much for your help!');
                //redirect to the job page
                var urlEvent = $A.get("e.force:navigateToURL");
                urlEvent.setParams({
                    "url": "/s"
                });
                urlEvent.fire();
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
            
            //show spinner as false
            component.set('v.showSpinner', false);
        });
        $A.enqueueAction(action);  
    }
})