var tasks = angular.module('tasks', []);
tasks.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

tasks.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('document', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){

        })
        .error(function(){
        });
    }
}]);

tasks.directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){
                // on mouseenter
                $(element).tooltip('show');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    };
});
tasks.controller('mainController',[ '$scope' ,'$http', '$filter'  , 'fileUpload' ,
function ($scope,$http,$filter,fileUpload)
{	
	$http.get('/api/tasks').success(function(data){
		 	$scope.tasks = data;
		 	for (var i = $scope.tasks.length - 1; i >= 0; i--) {
		 		$scope.tasks[i]['moreTaskText'] =false;
		 		$scope.tasks[i]['lessTaskText'] =false;
		 		$scope.tasks[i]['detailShow'] =false;
		 		$scope.tasks[i]['uploadShow'] =false;
		 		$scope.tasks[i]['remainderShow'] =true;
		 		if(i == 1)
		 		{
		 			$scope.tasks[i]['remainderShow'] =false;
		 			$scope.tasks[i]['remainderTime'] = "No Reminder Set";
		 		}
		 		
		 		$scope.tasks[i]['reviewShow'] =false;
		 		$scope.tasks[i]['id']= i;
		 		$scope.tasks[i]['taskDetailsInput'] = "";
		 		$scope.tasks[i]['currentText']  = $scope.tasks[i].description;
		 		if($scope.tasks[i].description.length >3)
				{
					console.log("More Text");
					$scope.tasks[i]['currentText'] = $scope.tasks[i].description.substring(0,3);
					$scope.tasks[i]['moreTaskText'] = true;
					$scope.tasks[i]['lessTaskText'] = false;
				}
		 	};
		 	console.log(data);
		 })
		.error(function(error){
				console.log(data);
			});
	
	$scope.showFullText = function(id){
		$scope.tasks[id]['currentText'] = $scope.tasks[id].description;
		$scope.tasks[id]['moreTaskText'] = false;
		$scope.tasks[id]['lessTaskText'] = true;
	};
	$scope.showLessText = function(id){
		$scope.tasks[id]['currentText'] = $scope.tasks[id].description.substring(0,3);
		$scope.tasks[id]['moreTaskText'] = true;
		$scope.tasks[id]['lessTaskText'] = false;

	};
    $scope.details = function(id)
    {
    	console.log("Details Clicked");
    	if($scope.tasks[id]['detailShow'] == true)
    	{
    		$scope.tasks[id]['detailShow'] = false;
    		
    	}
    	else
    	{
    		$scope.tasks[id]['detailShow'] = true;
   
    	}
    	
		$scope.tasks[id]['uploadShow'] = false;
		
		$scope.tasks[id]['reviewShow'] = false;
    };

    $scope.updateDetails = function(id,primarytId)
    {
    	var data = {};
    	data['details'] = $scope.tasks[id]['taskDetailsInput'];
    	console.log(data['details']);
    	$http.post('/api/task/'+primarytId, data).then(function(data){
    		$scope.tasks[id]['details'] = $scope.tasks[id]['taskDetailsInput']
    		$scope.tasks[id]['taskDetailsInput'] = "";
    		console.log(data);
    	}, function(error){
    		console.log(error);
    	});
    };

    $scope.upload = function(id)
    {

    	if($scope.tasks[id]['uploadShow'] == true)
    	{
    		$scope.tasks[id]['uploadShow'] = false;
    	}
    	else
    	{
    		$scope.tasks[id]['uploadShow'] = true;
    		
    	}
    	console.log("upload Clicked");
    	$scope.tasks[id]['detailShow'] = false;
		// $scope.tasks[id]['remainderShow'] = false;
		$scope.tasks[id]['reviewShow'] = false;
    };
    $scope.setRemainder = function(id)
    {
    	console.log("setRemainder Clicked");
    	$scope.tasks[id]['detailShow'] = false;
		$scope.tasks[id]['uploadShow'] = false;
		$scope.tasks[id]['reviewShow'] = false;
    };
    $scope.review = function(id)
    {
    	console.log("review Clicked");
    	if($scope.tasks[id]['reviewShow'] == true)
    	{
    		$scope.tasks[id]['reviewShow'] = false;
    	}
    	else
    	{
    		$scope.tasks[id]['reviewShow'] = true;
    	}
    	$scope.tasks[id]['detailShow'] = false;
		$scope.tasks[id]['uploadShow'] = false;
		$scope.tasks[id]['remainderShow'] = false;
    };

    $scope.uploadFile = function(id,primarytId) {
    	console.log("Uploading File"); 

	    var file = $scope.tasks[id]['documentUpload'];
        console.log('file is '+file );
        console.dir(file);
        var uploadUrl = '/api/fileUpload/'+primarytId;
        fileUpload.uploadFileToUrl(file, uploadUrl);
	};

}]);