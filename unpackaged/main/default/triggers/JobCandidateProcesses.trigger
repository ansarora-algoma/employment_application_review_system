trigger JobCandidateProcesses on SFDC_Job_Candidate__c (After Insert) {
    
    try {
        List<SFDC_Candidate__c> cantidateList = new List< SFDC_Candidate__c>();
        for (SFDC_Job_Candidate__c eachCandidate : [
                SELECT Id, SFDC_Candidate__c, SFDC_Job__c, SFDC_Job__r.Name, SFDC_Job__r.SFDC_Department__c
                FROM SFDC_Job_Candidate__c
                WHERE Id IN :Trigger.New
            ]) {
                if (eachCandidate.SFDC_Candidate__c  != null) {
                    SFDC_Candidate__c candidate = new SFDC_Candidate__c();
                    candidate.Position__c = eachCandidate.SFDC_Job__r.Name;
                    candidate.SFDC_Department__c = eachCandidate.SFDC_Job__r.SFDC_Department__c;
                    candidate.Id = eachCandidate.SFDC_Candidate__c;
                    cantidateList.add(candidate);
                }  
        }
        
        update cantidateList;
    
    } catch(Exception e) {
        System.debug(e);
    }
    
}