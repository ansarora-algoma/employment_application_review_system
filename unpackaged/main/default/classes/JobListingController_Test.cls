@isTest
public class JobListingController_Test {

    @isTest
    public static void testfetchAllJobs() {
        SFDC_Job__c job = new SFDC_Job__c();
        job.Name = 'Salesforce Developer';
        job.Job_Status__c = '01-Open';
        job.Job_Description__c = 'description';
        insert job;
        
        JobListingController.fetchAllJobs();
        
        JobListingController.fetchSpecificJob(job.Id);
        
        Id candidateId = JobListingController.applicationSubmit(job.Id, '{"attributes":{"type":"SFDC_Candidate__c"},"Name":"Anshul Arora"}');
        
        JobListingController.SaveFile(candidateId, 'file.docx', 'test string', '.doc', null);
    }
    
    @isTest
    public static void testFetchAndSubmitReferences() {
        SFDC_Job__c job = new SFDC_Job__c();
        job.Name = 'Salesforce Developer';
        job.Job_Status__c = '01-Open';
        job.Job_Description__c = 'description';
        insert job;
        
        SFDC_Candidate_Reference__c ref = new SFDC_Candidate_Reference__c();
        ref.Phone__c = '7845125478';
        ref.Email__c = 'test@trifinlabs.com';
        ref.Name__c = 'Test';
        
        Id candidateId = JobListingController.applicationSubmit(job.Id, '{"attributes":{"type":"SFDC_Candidate__c"},"Name":"Anshul Arora"}');
        
        JobListingController.createReferences(
            candidateId
        	, new List<SFDC_Candidate_Reference__c> {ref}
        );
        
        SFDC_Candidate_Reference__c reference = [SELECT Id FROM SFDC_Candidate_Reference__c LIMIT 1];
        JobListingController.fetchSpecificReference(reference.Id);
        JobListingController.submitReference(reference);
		        
    }
}