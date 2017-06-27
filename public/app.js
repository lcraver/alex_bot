var app = angular.module("AlexBot", []); 
app.controller("AlexController", function($scope, $http) {
    $scope.token = "";
    $scope.messageInput = "message";

    $scope.sendMessage = function() {
        if($scope.token == "")
        {
            $http({
                method: 'POST',
                url: 'http://localhost:3000/chat/new',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
            }).then(function successCallback(response) {
                console.log(response);
                $scope.token = response.data.data.token;
            }, function errorCallback(response) {
                console.log(response);
            });
        }
        else
        {
            $http({
                method: 'POST',
                data: "message="+ $scope.messageInput,
                url: 'http://localhost:3000/chat',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
            }).then(function successCallback(response) {
                console.log(response);
            }, function errorCallback(response) {
                console.log(response);
            });
        }
    }
});