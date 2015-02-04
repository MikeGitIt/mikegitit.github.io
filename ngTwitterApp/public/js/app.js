twitterApp = angular.module('twitterApp', ['ngMaterial', 'btford.socket-io'])
  .factory('socket', function(socketFactory) {
    return socketFactory({
      ioSocket: io.connect('http://localhost:9000/')
    });
  }).controller('AppCtrl', ['$scope', 'socket', function($scope, socket) {
 
    $scope.tabs = [];
    $scope.selectedIndex = 0;
    $scope.onTabSelected = onTabSelected;
 
    $scope.addTab = function(title, q) {
      var tabs = $scope.tabs;
      var style = 'tab' + (tabs.length % 4 + 1);
      var tab = {
        title: title,
        active: true,
        style: style,
        q: q
      };
      if (!dupes(tab)) {
        tabs.push(tab);
        $scope.tContent = '';
        $scope.tTitle = '';
        spawnSearch(q, tab);
      } else {
        alert('A search with this query already exists');
      }
    };
 
    $scope.removeTab = function(tab) {
      //https://github.com/angular/material/issues/573
      var tabs = $scope.tabs;
      for (var j = 0; j < tabs.length; j++) {
        if (tab.title == tabs[j].title) {
          tabs.splice(j, 1);
          $scope.selectedIndex = (j == 0 ? 1 : j - 1);
          socket.emit('remove', tab.q);
          break;
        }
      }
    };
 
    $scope.submit = function($event) {
      if ($event.which !== 13) return;
      if ($scope.tTitle) {
        $scope.addTab($scope.tTitle, $scope.tContent);
      }
    };
 
 
    // **********************************************************
    // Private Methods
    // **********************************************************
 
    function onTabSelected(tab) {
      $scope.selectedIndex = this.$index;
      updateScope(tab);
 
    }
 
    function updateScope(tab) {
      if ($scope.tabs[$scope.selectedIndex] && $scope.tabs[$scope.selectedIndex].q == tab.q) {
        $scope.tweets = $scope['tweets_' + tab.q];
      }
    }
 
    function spawnSearch(q, tab) {
      socket.emit('q', q);
      $scope['tweets_' + q] = [];
      socket.on('tweet_' + q, function(tweet) {
        console.log(q, tweet.id);
        if ($scope['tweets_' + q].length == 10) {
          $scope['tweets_' + q].shift();
        }
        $scope['tweets_' + q] = $scope['tweets_' + q].concat(tweet);
 
        updateScope(tab)
      });
    }
 
    function dupes(tab) {
      var tabs = $scope.tabs;
      for (var j = 0; j < tabs.length; j++) {
        if (tab.q == tabs[j].q) {
          return true;
        }
      }
      return false;
    }
 
    //$scope.addTab('interstellar', 'interstellar');
    //$scope.addTab('lucy', 'lucy');
 
  }]);

/************************************************************************************************

*** Line 1 : Create new Angular Module and inject the dependencies
*** Line 2 : Create a new instance of the socketFactory and expose it as a Factory
*** 
*** Line 6 : Create an App controller
*** 
*** Line 12 : Logic for adding a new Tab
*** 
*** Line 31: Logic to remove a Tab
*** 
*** Line 44 : Logic for Add New Search button
*** 
*** Line 56 : Whenever a tab is selected, we set the current selected tab index.
*** 
*** Line 68 : This method is fired when we add a new search. We emit an event to create a new Stream using Twit. And then start listening to it for the tweet event.
*** 
*** Line 73 : We show only the latest 10 tweets from the stream at any point.
*** 
*************************************************************************************************/