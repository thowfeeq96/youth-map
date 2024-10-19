document.addEventListener("DOMContentLoaded", function () {
  var map = L.map("map").setView([51.509, -0.09], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Fetch data from Google Sheets API
  fetchGoogleSheetData()
    .then(function (studentData) {
      var markers = L.markerClusterGroup();

      // Add markers to the marker cluster group for each individual

      studentData.forEach(function (student) {
        var locationWithUK = student.location + ", United Kingdom";

        // Geocode location using OpenCage Geocoding API
        geocodeLocation(locationWithUK)
          .then(function (result) {
            var marker = L.marker([result.lat, result.lon]);
            var popupContent = `<b>Name:</b> ${student.name}<br><b>Status:</b> ${student.status}<br><b>Mobile:</b> ${student.mobile}<br><b>Email:</b> ${student.email}`;
            marker.bindPopup(popupContent);
            //marker.addTo(map);
            markers.addLayer(marker);
          })
          .catch(function (error) {
            console.error("Geocoding error:", error);
          });
      });

      // Add the marker cluster group to the map
      map.addLayer(markers);

      // Add geocoder control
      var geocoder = L.Control.geocoder({
        defaultMarkGeocode: false,
      })
        .on("markgeocode", function (event) {
          var latlng = event.geocode.center;
          map.setView(latlng, 15);
        })
        .addTo(map);
    })
    .catch(function (error) {
      console.error("Error fetching data from Google Sheets:", error);
    });

  // Function to fetch data from Google Sheets API
  function fetchGoogleSheetData() {
    var sheetId = "1NnVxRweMY815_S465x_Vt2htNqLWBgL_zzQ47n-a4OA";
    var apiKey = "AIzaSyDzEz22yaBHMtvLkPqYewMBvuiHEOFXDNM";
    var sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/1NnVxRweMY815_S465x_Vt2htNqLWBgL_zzQ47n-a4OA/values/Sheet1?key=AIzaSyDzEz22yaBHMtvLkPqYewMBvuiHEOFXDNM`;

    return fetch(sheetUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        var headers = data.values[0];
        var studentData = data.values.slice(1).map((row) => {
          var student = {};
          headers.forEach((header, index) => {
            student[header.toLowerCase()] = row[index];
          });
          return student;
        });
        return studentData;
      });
  }
  // Function to geocode location using OpenCage Geocoding API
  function geocodeLocation(location) {
    var apiKey = "2ca474f459c948ddbb6e9abc2093a5e5";
    var apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=2ca474f459c948ddbb6e9abc2093a5e5`;

    return fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.results.length > 0) {
          var result = data.results[0].geometry;
          return { lat: result.lat, lon: result.lng };
        } else {
          throw new Error("Location not found");
        }
      });
  }
});
