annotate Auth with @(requires: 'any');

@requires: 'any'
service Auth{
    @requires: 'any'
    action Authorize(encryptedUrl: String) returns String;
}