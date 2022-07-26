({
	hideSpinner : function (component, event, helper) {
        var spinner = component.find('spinner');
        var evt = spinner.get("e.toggle");
        evt.setParams({ isVisible : false });
        evt.fire();    
    },
    
    init : function(component, event, helper) {
        var action = component.get("c.fetchAllJobs");

        // Create a callback that is executed after 
        // the server-side action returns
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set('v.AllJobListings', response.getReturnValue());
                component.set('v.backupAllJobListings', response.getReturnValue());
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
        });
		$A.enqueueAction(action);
    },
    
    handleJobClick : function(component, event, helper) {
        var tar = event.target;
        var jobId = tar.dataset.jobid;
        if (jobId) {
            //redirect to the job page
            var urlEvent = $A.get("e.force:navigateToURL");
            urlEvent.setParams({
              "url": "/s/jobdetail?jobId="+jobId
            });
            urlEvent.fire();
        }
    },
    
    handleKeyUp : function(component, event, helper) {
        // enter pressed
        if (event.which != 13) {
            var searchString = component.get('v.searchString');
            var allJobListings = component.get('v.backupAllJobListings');
            var jobsMeetingSearch = [];
            
            if (searchString) {
            	for (var i = 0; i < allJobListings.length; i++) {
                if (allJobListings[i].Name.toLowerCase().indexOf(searchString.toLowerCase()) >= 0) {
                        jobsMeetingSearch.push(allJobListings[i]);
                    }
                }    
            } else {
                jobsMeetingSearch.push.apply(jobsMeetingSearch, allJobListings);
            }
            
            component.set('v.AllJobListings', jobsMeetingSearch);
        }
    }
    
})