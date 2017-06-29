var app = angular.module("AlexBot", []); 
app.controller("AlexController", function($scope, $http, $window) {
    $scope.token = "";
    $scope.messageInput = "";
    $scope.messages = [];

    let ip = "http://10.142.59.195:8000/";

    $scope.allSessions = [];

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
                url: ip + 'chat',
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
            url: ip + 'chat/new',
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
                url: ip + 'chat',
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

        setTimeout( function(){ 
            updateScroll();
        }, 100);
    }

    function updateScroll(){
        var elements = document.getElementsByClassName("messages");

        for(let i = 0; i < elements.length; i++) {
            elements[i].scrollTop = elements[i].scrollHeight;
        }
    }

    $window.addEventListener('beforeunload', function(event) {
        $scope.destroySession();
    });  

    getAllChats();
    setInterval(getAllChats, 5000);

    function getAllChats() {
        $http({
            method: 'GET',
            url: ip + 'sessions',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }
        }).then(function successCallback(response) {
            //console.log(response.data.data);
            $scope.allSessions = Object.keys(response.data.data.sessions).map(function (key) { return response.data.data.sessions[key]; });

            $scope.allSessions.sort(function(a,b){
                return b.log.length - a.log.length;
            });

            setTimeout( function(){ 
                //updateScroll();
            }, 100);
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    $scope.compareMessageLengths = function(v1, v2) {
        // If we don't get strings, just compare by index
        if (v1.type !== 'string' || v2.type !== 'string') {
            return (v1.index < v2.index) ? -1 : 1;
        }

        // Compare strings alphabetically, taking locale into account
        return v1.value.localeCompare(v2.value);
    }
});