/*
Author: Mohit Gupta
*/
var tilesURL = []
var apiObject

/*
Starter Function that gets DroneDeploy api and calls
helper:convertTilesToPdfHelper
*/
function generateAndDownloadPDF() {
    new DroneDeploy({
        version: 1
    }).then(function(api) {
        convertTilesToPdfHelper(api);
    });
}

/*
Function to get the plan that is the currently visible to the user
and passes the response to helper :processTilesResponseAndSavePDF
@param tilesResponse -Drone Deploy Api Object
*/
function convertTilesToPdfHelper(api) {
    apiObject = api;
    apiObject.Plans.getCurrentlyViewed()
        .then(function(plan) {
            return fetchTilesForPlan(plan)
        })
        .then(processTilesResponseAndSavePDF)
}

/*
Function to fetch tiles for a plan
@param tilesResponse -Plan Object
*/
function fetchTilesForPlan(plan) {
    return apiObject.Tiles.get({
        planId: plan.id,
        layerName: 'ortho',
        zoom: parseInt(18)
    })
}

/*
Function to creates jsPDF object, process tiles response, extracts tiles,
convert the URLS to Data URL using helper:getDataURLUsingFileReader and
creates/updates jsPDF object with parsed DataURL's returned from 
helper:getDataURLUsingFileReader
@param tilesResponse -Tiles Object
*/
function processTilesResponseAndSavePDF(tilesResponse) {
    const doc = new jsPDF()
    console.log(tilesResponse)
    const tiles = tilesResponse.tiles
    for (let i = 0; i < tiles.length; i++) {
        getDataURLUsingFileReader(tiles[i], function(dataURL) {
            doc.addImage(dataURL, 'PNG', 15, 45)
        })
    }
    doc.save('Map.pdf');
}


/*
Function to Convert image URL to image Base64 data url using Filereader
FileReader 
@param tile -url
@param ouptput - callback called when url is converted
*/
function getDataURLUsingFileReader(url, output) {
    const xhr = new XMLHttpRequest()
    xhr.cors = '*'
    xhr.onload = function() {
        const reader = new FileReader()
        reader.onloadend = function() {
            output(reader.result)
        }
        reader.readAsDataURL(xhr.response)
    }
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.send()
}