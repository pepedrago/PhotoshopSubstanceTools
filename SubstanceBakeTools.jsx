var rersourcesPath =  "\"C:\\Program Files\\Allegorithmic\\Substance Designer\\resources\\packages\"";
var batchtoolsPath =    "\"C:\\Program Files\\Allegorithmic\\Substance Automation Toolkit\\";
var docPath;
var activeDoc;
try
{
    docPath = app.activeDocument.path;
    activeDoc = app.activeDocument;
}
catch(e)
{
    alert("You need to have a saved document opened");
}

var outputPath;
var BatchFile;

var Mesh = null;
var MeshName = "no mesh selected";
var Commands = [];
var OutputSize = []


var stbUI = new Window("dialog","Substance Texture Baker");



// select a mesh to bake
var fileSelectGroup = stbUI.add("panel",undefined,"Select Mesh");
MeshSelectButton = fileSelectGroup.add("Button",undefined,MeshName);
MeshSelectButton.addEventListener("click",SelectMesh);
var RenderByIDCheck = fileSelectGroup.add("checkbox",undefined,"Use filename as ID");
RenderByIDCheck.value = false;
fileSelectGroup.alignChildren = "left";
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var baseMapGroup = stbUI.add("panel");
baseMapGroup.alignChildren = "left";
var aoCheck = baseMapGroup.add("checkbox",undefined,"AO");
aoCheck.value = true;
var curvatureCheck = baseMapGroup.add("checkbox",undefined,"Curvature");
curvatureCheck.value = true;
var normalCheck = baseMapGroup.add("checkbox",undefined,"Normal");
normalCheck.value = false;
var wNormalsCheck = baseMapGroup.add("checkbox",undefined,"WS Normals");
wNormalsCheck.value = true;
var positionCheck = baseMapGroup.add("checkbox",undefined,"Position");
positionCheck.value = true;
var colorMapGroup = stbUI.add("panel");
var colorMCheck = colorMapGroup.add("checkbox",undefined,"ColorMask");
positionCheck.value = true;
var colorMaskCheck = colorMapGroup.add("checkbox",undefined,"ColorMask");
colorMaskCheck.value = false;
var checkAll = stbUI.add("checkbox",undefined,"Check all");
var SubstanceFiles= stbUI.add("listbox",undefined,["One","Two","Three"],{multiselect:true});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
stbUI.addEventListener("click",function(event){

    if(event.target==checkAll){
         for(var i=0; i< baseMapGroup.children.length;i++){
                baseMapGroup.children[i].value = checkAll.value;
        }
        };
   
    });

checkAll.onChanging  = function(){
    for(var i=0; i< baseMapGroup.children.length;i++){
                baseMapGroup.children[i].value = (baseMapGroup.children[i]==false)?true:false;
        }
    }

// Ok and Cancel Buttons
var OkAndCancelButtons = stbUI.add("group");
OkAndCancelButtons.alignment = "right";
OkAndCancelButtons.add("button",undefined,"OK");
OkAndCancelButtons.add("button",undefined,"CANCEL");
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Init();
function Init()
{
    GetBakeDimensions();
    outputPath = CreateTempFolder(docPath);
}
function Main()
{
    if(Mesh==null)
    {
        alert("No Mesh selected");
        return;
    }
    CreateCommands();
    WriteBat(Commands);
    ExecuteBat();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function SelectMesh(){
    Mesh = File.openDialog("Selection prompt");
    if(Mesh!=null) MeshSelectButton.text = Mesh.name;
    
    }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function CreatePlaceholder(_outputPathFS,_name)
{
   
    var _placeholder = app.documents.add(activeDoc.width,activeDoc.height,72,_name, NewDocumentMode.RGB);
    SavePNG(_placeholder,outputPath); 
    PlaceLinkedSmartObject(_outputPathFS+"\\"+_name);
   
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function GetBakeDimensions()
{
      for(var i=0; i<2;i++)
      {
          
        var _dimensions = (i==0)?activeDoc.width:activeDoc.height;
        
        switch(_dimensions)
        {
               case 512:
               OutputSize[i] = 9;
               break;
               case 1024:
               OutputSize[i] = 10;
               break;
               case 2048:
               OutputSize[i] = 11;
               break;
               case 4096:
               OutputSize[i] = 12;
               break;
               default:
               alert("The Document Size has to be between 512² and 4096²");
               break;
        }
      }
 }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// this executed once we press ok
if(stbUI.show()==1) Main();

function CreateCommands()
{
    // file path needs to be formatted, decodeURI does the job
    var _filePath =decodeURI(Mesh.fsName);
    var _outputPath = decodeURI(outputPath.fsName);
    var _MeshName = Mesh.name.split(".FBX")[0];
    var _inputSelection = "";
    
    
    if(RenderByIDCheck.value == true){
        _inputSelection = " --input-selection "+ " \""+_MeshName+"\"";
        alert(_inputSelection);
        //_inputSelection = _MeshName;
    }
    
    for(var i=0;i<baseMapGroup.children.length;i++)
    {
        if(baseMapGroup.children[i].value!=true)continue;
       
        switch(baseMapGroup.children[i])
        {
            case aoCheck: 
            CreatePlaceholder(_outputPath,_MeshName+"_ambient-occlusion-from-mesh.png")
            Commands.push(batchtoolsPath+"sbsbaker.exe\" ambient-occlusion-from-mesh"+ " \"" +_filePath+ "\" " + " --output-size "+ OutputSize[0]+","+OutputSize[1]+_inputSelection+" --output-path "+_outputPath);
            break;
            case  curvatureCheck:
            CreatePlaceholder(_outputPath,_MeshName+"_curvature.png")
            Commands.push(batchtoolsPath+"sbsbaker.exe\" curvature"+ " \"" +_filePath+ "\" " + " --output-size "+ OutputSize[0]+","+OutputSize[1]+" --input-selection \"object\" --output-path "+_outputPath);
            break;
            case  normalCheck:
            CreatePlaceholder(_outputPath,_MeshName+"_normal-from-mesh.png")
            Commands.push(batchtoolsPath+"sbsbaker.exe\" normal-from-mesh"+ " \"" +_filePath+ "\" " + "--highdef-mesh "+ _filePath + " --output-size "+ OutputSize[0]+","+OutputSize[1]+" --input-selection \"object\" --output-path "+_outputPath);
            break;
            case  wNormalsCheck:
            CreatePlaceholder(_outputPath,_MeshName+"_normal-world-space.png")
            Commands.push(batchtoolsPath+"sbsbaker.exe\" normal-world-space"+ " \"" +_filePath+ "\" " + " --output-size "+ OutputSize[0]+","+OutputSize[1]+" --input-selection \"object\" --output-path "+_outputPath);
            break;
            case  positionCheck:
            CreatePlaceholder(_outputPath,_MeshName+"_position-from-mesh.png")
            Commands.push(batchtoolsPath+"sbsbaker.exe\" position-from-mesh"+ " \"" +_filePath+ "\" " + "--highdef-mesh "+ _filePath + " --output-size "+ OutputSize[0]+","+OutputSize[1]+" --input-selection \"object\" --output-path "+_outputPath);
            break;
        }     
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function WriteBat(_commands)
{
    var Name = app.activeDocument.name.replace(/\.[^\.]+$/, '');
    var Ext = decodeURI(app.activeDocument.name).replace(/^.*\./,'');
    if (Ext.toLowerCase() != 'psd')
        return;

    var Path = app.activeDocument.path;
    BatchFile = File(outputPath + "/" + Mesh.name +".bat");

    if(BatchFile.exists)
        BatchFile.remove();

    BatchFile.encoding = "UTF8";
    BatchFile.open("w");
    for each(var _command in _commands){
         //alert(_command);
        BatchFile.writeln(_command);
        }
   
    BatchFile.close();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function ExecuteBat()
{
   
    BatchFile.execute();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function CreateTempFolder(path) {  
  var folder = new Folder(path+"/temp");  
  if (!folder.exists) {  
    folder.create();  
  }
  return folder;
}  
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function SavePNG(_file,_path){
    var pngOpts = new ExportOptionsSaveForWeb; 
    pngOpts.format = SaveDocumentType.PNG
    pngOpts.PNG8 = false; 
    pngOpts.transparency = true; 
    pngOpts.interlaced = false; 
    pngOpts.quality = 100;
    _file.exportDocument(new File(_path),ExportType.SAVEFORWEB,pngOpts); 
  
     _file.close(SaveOptions.DONOTSAVECHANGES);  
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function PlaceLinkedSmartObject(_fileToPlace)
{
var idPlc = charIDToTypeID( "Plc " );
    var desc49 = new ActionDescriptor();
    var idIdnt = charIDToTypeID( "Idnt" );
    desc49.putInteger( idIdnt, 14 );
    var idnull = charIDToTypeID( "null" );
    desc49.putPath( idnull, new File( _fileToPlace ) );
    var idLnkd = charIDToTypeID( "Lnkd" );
    desc49.putBoolean( idLnkd, true );
    var idFTcs = charIDToTypeID( "FTcs" );
    var idQCSt = charIDToTypeID( "QCSt" );
    var idQcsa = charIDToTypeID( "Qcsa" );
    desc49.putEnumerated( idFTcs, idQCSt, idQcsa );
    var idOfst = charIDToTypeID( "Ofst" );
        var desc50 = new ActionDescriptor();
        var idHrzn = charIDToTypeID( "Hrzn" );
        var idPxl = charIDToTypeID( "#Pxl" );
        desc50.putUnitDouble( idHrzn, idPxl, 0.000000 );
        var idVrtc = charIDToTypeID( "Vrtc" );
        var idPxl = charIDToTypeID( "#Pxl" );
        desc50.putUnitDouble( idVrtc, idPxl, 0.000000 );
    var idOfst = charIDToTypeID( "Ofst" );
    desc49.putObject( idOfst, idOfst, desc50 );
    executeAction( idPlc, desc49, DialogModes.NO );    
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////