({
    doInit : function(component, event, helper) {
      
        // This is url query parameter
  		var candidateId = helper.getParameterByName(component , event, helper, 'candidateId');
        component.set('v.candidateId', candidateId);
    },
    handleSubmitReferences : function(component, event, helper) {
		
        var allValid = component.find('fieldId').reduce(function (validSoFar, inputCmp) {
                inputCmp.showHelpMessageIfInvalid();
                return validSoFar && inputCmp.get('v.validity').valid;
             }, true);
        
        if (allValid) {
            let uniquePhoneSet = new Set();
            let uniqueEmailSet = new Set();
            var allReferences = component.get('v.reference');
            for (var i = 0; i < allReferences.length; i++) {
            	uniquePhoneSet.add(allReferences[i].Phone__c);
                uniqueEmailSet.add(allReferences[i].Email__c);
            }
            
            if (uniquePhoneSet.size < 3 || uniqueEmailSet.size < 3) {
                helper.showToast(component, event, 'error', 'Please provide unique values for email and phone and then try again.')
            	return;
            }
            
            //show spinner as true
            component.set('v.showSpinner', true); 
            helper.createReferences(component, allReferences);
        } else {
            helper.showToast(component, event, 'error', 'Please fill the required fields and then try again.')
        }
	}
})