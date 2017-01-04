//app.js
var template;
var $neighborhoodsList;
var allNeighborhoods = [];
var neighborhoodId;
var $placeList;
var placeTemplate;
var placeToUpdateId;
var currentNeighborhoodId;

$(document).ready(function(){
  console.log("DOM Ready!");

//Reload Page
  $('#title').click(function() {
    location.reload();
  });

  //Neighborhoods Handlebars Template
  $neighborhoodsList = $('#neighborhoodTarget');
  var source = $('#neighborhood-template').html();
  template = Handlebars.compile(source);

  //Places Handlebars Template
  var source = $('#place-template').html();
  placeTemplate = Handlebars.compile(source);

  $.ajax({
    method: 'GET',
    url: '/api/neighborhoods',
    success: onSuccess,
    error: onError
      });

  $('#neighborhoodTarget').on('click','.neighborhood-id', function(e){
    neighborhoodId = $(this).data('neighborhood-id');
    renderSpecificNeighborhood();
  //Turns off event listeners for choosing neighborhoods
    $('#neighborhoodTarget').off('click', '.neighborhood-id');
  }); //on click

  }); //Document On Ready

  function onSuccess(json){
    allNeighborhoods = json;
    render();
  }

  function onError(){
    $('#neighborhoodTarget').text('Failed to load neighborhoods, is the server running?');
  }

  function render(){
    var neighborhoodHtml;
    var placeHtml;
    allNeighborhoods.forEach(function(json){
      neighborhoodHtml = template({ neighborhood: json });
      $neighborhoodsList.append(neighborhoodHtml);
    });
    // renderSpecificNeighborhood();
  }; //render

  function renderSpecificNeighborhood () {
    $('#neighborhoodTarget').empty();
    allNeighborhoods.forEach(function(json){
      neighborhoodHtml = template({ neighborhood: json });
      placeHtml = placeTemplate({neighborhood: json});
      if(json._id === neighborhoodId ){
      $neighborhoodsList.append(neighborhoodHtml);
      $neighborhoodsList.append(placeHtml);
      }
    }) //forEach
    initializeCrud();
    //Unhides Add Place Button
    $('#openPlaceModal').removeClass('hide');
    //Initializes Dropdown in Modals
    $('select').material_select();
  }

  function initializeCrud(){
    //when the add place button is clicked, display the modal
    $("#openPlaceModal").click(function (){
      currentNeighborhoodId = $(this).closest('.Neighborhood').data('neighborhood-id');
      $('#modal1').data('neighborhood-id', currentNeighborhoodId);
      $('#modal1').modal();//display the modal!
    }); //WORKING

    //Initialize edit place modal
    $(".edit_place").click(function(){
      placeToUpdateId = $(this).closest('.place-id').data('place-id');
      $('#modal2').modal();
    }); //WORKING

//ADD PLACE
    $('#addPlace').on('click', function(target){
      console.log( currentNeighborhoodId, neighborhoodId);
      target.preventDefault();
      var $modal1 = $('#modal1');
          var $placeNameField = $modal1.find('#place_name');
          var $placeAddressField = $modal1.find('#place_address');
          var $placeCategoryField = $modal1.find('#place_category');
          var $placeGoodStuffField = $modal1.find('#good_stuff');
          var $placeOpeningHourField = $modal1.find('#opening_hour');
          var $placeClosingHourField = $modal1.find('#closing_hour');
          var dataToPost = {
            name: $placeNameField.val(),
            address: $placeAddressField.val(),
            category: $placeCategoryField.val(),
            goodStuff: $placeGoodStuffField.val(),
            openingHour: $placeOpeningHourField.val(),
            closingHour: $placeClosingHourField.val()
            };
      var testId = $modal1.data(testId);
      $.ajax({
        method: 'POST',
        url: 'api/neighborhoods/' + neighborhoodId + '/places',
        data: dataToPost,
        success: newPlaceSuccess,
        error: newPlaceError
      });
    }); //WORKING


    function newPlaceSuccess(data){
      console.log("new place success", data);
      console.log("nHoodId inside newPlaceSuccess ", neighborhoodId);
      allNeighborhoods.forEach(function (neighborhood){
        if(neighborhood._id === neighborhoodId){
          neighborhood.places.push(data);
          console.log("found neighborhood places ", neighborhood.places);
        }
      });
      renderSpecificNeighborhood();
    } //WORKING

    function newPlaceError(){
      console.log('new place error!');
    }

//EDIT PLACE
    $('#editPlace').on('click', function(target){
        target.preventDefault();
        console.log(placeToUpdateId, " place id when save changes button clicked")
        var $modal2 = $('#modal2');
        var $placeNameField = $modal2.find('#place_name');
        var $placeAddressField = $modal2.find('#place_address');
        var $placeCategoryField = $modal2.find('#place_category');
        var $placeGoodStuffField = $modal2.find('#good_stuff');
        var $placeOpeningHourField = $modal2.find('#opening_hour');
        var $placeClosingHourField = $modal2.find('#closing_hour');

        var dataToUpdate = {
          name: $placeNameField.val(),
          address: $placeAddressField.val(),
          category: $placeCategoryField.val(),
          goodStuff: $placeGoodStuffField.val(),
          openingHour: $placeOpeningHourField.val(),
          closingHour: $placeClosingHourField.val()
        }
        console.log(dataToUpdate, " dataToUpdate");
        $.ajax({
          method: 'PATCH',
          url: 'api/neighborhoods/' + neighborhoodId +'/places/'+ placeToUpdateId,
          data: dataToUpdate,
          success: editPlaceSuccess,
          error: editPlaceError
        });
    });

    function editPlaceSuccess(data){
      console.log("place  id to update", placeToUpdateId);
      $('#newPlaceForm input').val('');
      allNeighborhoods.forEach(function(neighborhood){
        if(neighborhood._id === neighborhoodId){
          neighborhood.places.forEach(function (place, i){
            if(place._id === placeToUpdateId){
              neighborhood.places.splice(i,1,data);
            }
          });
          console.log(neighborhood.places, "this is neighborhood after splice");
        }
      });
      renderSpecificNeighborhood();
      console.log('edit form hit');
      console.log(data, " this is data");

    }
    function editPlaceError (){
      console.log("Edit place error!")
    }

//DELETE PLACE
  $(".delete_place").click(function (){
    var currentPlaceId = $(this).closest('.place-id').data('place-id');
    var url = '/api/neighborhoods/' + neighborhoodId + '/places/' + currentPlaceId;
    $.ajax({
      method: 'DELETE',
      url: url,
      success: handlePlaceDeleteResponse,
      error: placeDeleteError
      });
    }); //WORKING
  }

  function handlePlaceDeleteResponse(data) {
    allNeighborhoods.forEach(function(neighborhood){
      if(neighborhood._id === neighborhoodId){
        neighborhood.places.forEach(function (place, i){
          if(place._id === data._id){
            neighborhood.places.splice(i,1);
          }
        });
        console.log(neighborhood.places, "this is neighborhood after splice");
      }
    });
    var $divToDelete = $('#' + data._id);
    $divToDelete.remove();
  } //WORKING

  function placeDeleteError() {
    console.log("Place Deletion Error!");
  }
