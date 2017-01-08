'use strict';

 // These are the real restuarant listings that will be shown to the user.
var initialLocations = [
    {
	    name: 'Mayuri Indian Cuisine',
	    lat: 37.3518, 
	    lng: -121.9626
    },
    {
	    name: 'Bombay Gardens Restaurant',
	    lat: 37.3541, 
	    lng: -121.9978
    },
    {
	    name: 'Mezbaan Restaurant',
	    lat: 37.3950, 
	    lng: -121.9458
    },
    {
	    name: 'Amber India',
	    lat: 37.3972, 
	    lng: -122.1078
    },
    {
	    name: 'Deedee',
	    lat: 37.3438, 
	    lng: -121.9407
    },
    {
	    name: 'Sagar Vegstaurant',
	    lat: 37.3528, 
	    lng: -121.9662
    },
    {
	    name: 'UlavacharU',
	    lat: 37.3604, 
	    lng: -122.0225
    },
    {
	    name: 'Peacock Indian Cuisine',
	    lat: 37.3751, 
	    lng: -122.0603
    }

];

//Global variables
var map;
var clientId;
var clientSecret;

// formatting a 10-digit phone number referenced from  http://snipplr.com/view/65672/10-digit-string-to-phone-format/
 

function formatPhone(phonenum) {
    var regexObj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (regexObj.test(phonenum)) {
        var parts = phonenum.match(regexObj);
        var phone = "";
        if (parts[1]) { phone += "+1 (" + parts[1] + ") "; }
        phone += parts[2] + "-" + parts[3];
        return phone;
    }
    else {
        //invalid phone number
        return phonenum;
    }
}

var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.lng = data.lng;
	this.url = "";
	this.stree = "";
	this.city = "";
	this.phone = "";


	this.visible = ko.observable(true);

	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.lng + '&client_id=' + clientId + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

    $.getJSON(foursquareURL).done(function(data) {
    	var results = data.response.venues[0];
    	self.URL = results.url;
    	if (typeof self.URL === 'undefined') {
    		self.URL = "";
    	}
    	self.street = results.location.formattedAddress[0];
    	self.city = results.location.formattedAddress[1];
    	self.phone = results.contact.phone;

    	if (typeof self.phone === 'undefined') {
    		self.phone = "";
            }else {
            	self.phone = formatPhone(self.phone);
            }
    }).fail(function() {
    	alert("There was an error with the Foursquare API call.Please try again.");
    });



    this.populateInfoWindow = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content">' + self.phone + "</div></div>";

    this.infoWindow = new google.maps.InfoWindow({content: self.populateInfoWindow});

    this.marker = new google.maps.Marker({
    	position: new google.maps.LatLng(data.lat, data.lng),
			map: map,
			title: data.name
    });

    this.showMarker = ko.computed(function() {
    	if(this.visible() === true) {
    		this.marker.setMap(map);
    	}else {
    		this.marker.setMap(null);
    	}
    	return true;
    }, this);

    this.marker.addListener('click', function(){
		self.populateInfoWindow = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content"><a href="tel:' + self.phone +'">' + self.phone +"</a></div></div>";

        self.infoWindow.setContent(self.populateInfoWindow);

        self.infoWindow.open(map, this);

		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});

	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};

function AppViewModel() {
	var self = this;

	this.searchTerm = ko.observable("");

	this.locationList = ko.observableArray([]);

	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: {lat: 37.354107, lng: -121.955238}
	});

	clientId = "CL5QIQHND1KIKOGGN4QGYPRMWJQLCBH340G1FVBAKYGSTZOV";
	clientSecret = "X1S0TVUB0ZUNQNL0KELMIJJRW1VRBNIVN0XTEOAXYBYPT3GI";

	initialLocations.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	}); 

	this.filteredList = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(filter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);

/*AppViewModel.markers = ko.dependentObservable(function() {
    var self = this;
    var search = self.query().toLowerCase();
    return ko.utils.arrayFilter(markers, function(marker) {
    if (marker.title.toLowerCase().indexOf(search) >= 0) {
            marker.boolTest = true;
            return marker.visible(true);
        } else {
            marker.boolTest = false;
            setAllMap();
            return marker.visible(false);
        }
    });       
}, AppViewModel); */


	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}

function initMap() {
	ko.applyBindings(new AppViewModel());
}

function errorHandling() {
	alert("Google Maps has failed to load. Please check your internet connection and try again.");
}



