var app = angular.module("AlexBot", []); 
app.controller("AlexController", function($scope, $http, $window) {
    $scope.token = "";
    $scope.messageInput = "";
    $scope.messages = [];

    $scope.initChat = function() {
        initChatMessage();
    }

    $scope.sendMessage = function() {
        if($scope.token == "")
        {
            initChatMessage();
            sendChatMessage();
        }
        else
        {
            sendChatMessage();
        }
    }

    $scope.destroySession = function() {
        if($scope.token != "")
        {
             $http({
                method: 'DELETE',
                data: "token="+$scope.token,
                url: 'http://localhost:3000/chat',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }
            }).then(function successCallback(response) {
            }, function errorCallback(response) {
                console.log(response);
            });

            $scope.token = "";
        }
    }

    function initChatMessage() {
        $http({
            method: 'POST',
            url: 'http://localhost:3000/chat/new',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }
        }).then(function successCallback(response) {
            $scope.token = response.data.data.token;
            addToChatLog("alex", response.data.data.response, new Date());
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    function sendChatMessage() {
        if($scope.messageInput != "" && $scope.messageInput != null) {
            let messageInputTmp = $scope.messageInput;
            $scope.messageInput = "";
            addToChatLog("", messageInputTmp, new Date());
            $http({
                method: 'POST',
                data: "message="+messageInputTmp+"&token="+$scope.token,
                url: 'http://localhost:3000/chat',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }
            }).then(function successCallback(response) {
                console.log(response);
                addToChatLog("alex", response.data.data.response, new Date());
            }, function errorCallback(response) {
                $scope.messages.splice(-1,1); // remove last user submitted message
                $scope.messageInput = messageInputTmp; // add the message back to message input
            });
        }
    };

    function addToChatLog(user, message, time) {
        let tmpMessage = {
            user: user,
            message: message,
            time: time
        }

        $scope.messages.push(tmpMessage);
        updateScroll();
    }

    function updateScroll(){
        var element = document.getElementById("messages");
        element.scrollTop = (element.scrollHeight);
    }

    $window.addEventListener('beforeunload', function(event) {
        $scope.destroySession();
    });  

    setInterval(function() {
        updateScroll();
    },500);
});