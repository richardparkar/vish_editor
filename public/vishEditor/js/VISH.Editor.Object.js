VISH.Editor.Object = (function(V,$,undefined){
		
	var contentToAdd = null;
	var uploadDivId = "tab_object_upload_content";
	var urlDivId = "tab_object_from_url_content";
	var urlInputId = "object_embed_code";
		
	var init = function(){
		V.Editor.Object.LRE.init();
		V.Editor.Object.Repository.init();
		V.Editor.Object.Live.init();
		V.Editor.Object.Web.init();
		V.Editor.Object.PDF.init();
		V.Editor.Object.Snapshot.init();
		
		var urlInput = $(urlDivId ).find("input");
		$(urlInput).watermark('Paste SWF file URL');
		
		//Load from URL
		$("#" + urlDivId + " .previewButton").click(function(event) {
			if(V.Police.validateObject($("#" + urlInputId).val())[0]){
				contentToAdd = V.Editor.Utils.autocompleteUrls($("#" + urlInputId).val());
				drawPreview(urlDivId, contentToAdd)    
			}
		});
		
		//Upload content
		var options = V.Editor.getOptions();
		var tagList = $("#" + uploadDivId + " .tagList")
		var bar = $("#" + uploadDivId + " .upload_progress_bar");
		var percent = $("#" + uploadDivId + " .upload_progress_bar_percent");
    
		$("#" + uploadDivId + " input[name='document[file]']").change(function () {
			var filterFilePath = V.Editor.Utils.filterFilePath($("#" + uploadDivId + " input:file").val());
			$("#" + uploadDivId + " input[name='document[title]']").val(filterFilePath);
			_resetUploadFields();
			$(tagList).parent().show();
			$("#" + uploadDivId + ' form' + ' .button').show();
			$("#" + uploadDivId + " .upload_progress_bar_wrapper").hide();
		});
		
		
		$("#" + uploadDivId + " #upload_document_submit").click(function(event) {
			if(!V.Police.validateFileUpload($("#" + uploadDivId + " input[name='document[file]']").val())[0]){
				event.preventDefault();
			} else {
				if (options) {
					var description = "Uploaded by " + V.User.getName() + " via Vish Editor"
					$("#" + uploadDivId + " input[name='document[description]']").val(description);
					$("#" + uploadDivId + " input[name='document[owner_id]']").val(V.User.getId());
					$("#" + uploadDivId + " input[name='authenticity_token']").val(V.User.getToken());
					$("#" + uploadDivId + " .documentsForm").attr("action", V.UploadObjectPath);
					var tagList = $("#" + uploadDivId + " .tagList");
					$("#" + uploadDivId + " input[name='document[tag_list]']").val(V.Editor.Utils.convertToTagsArray($(tagList).tagit("tags")));
					$(tagList).parent().hide();
					$("#" + uploadDivId + " .upload_progress_bar_wrapper").show();
				}
			}
		});
    		
        
		$("#" + uploadDivId + ' form').ajaxForm({
			beforeSend: function() {
				var percentVal = '0%';
				bar.width(percentVal);
				percent.html(percentVal);
			},
			uploadProgress: function(event, position, total, percentComplete) {
				var percentVal = percentComplete + '%';
				bar.width(percentVal)
				percent.html(percentVal);
			},
			complete: function(xhr) {
				switch(V.Configuration.getConfiguration()["mode"]){
					case V.Constant.NOSERVER:
						processResponse("{\"src\":\"/vishEditor/images/excursion_thumbnails/excursion-01.png\"}");
					break;
					case V.Constant.VISH:
						processResponse(xhr.responseText);
					break;
					case V.Constant.STANDALONE:
						processResponse(xhr.responseText);
					break;
				}
				var percentVal = '100%';
				bar.width(percentVal)
				percent.html(percentVal);
			},
			error: function(error){
				V.Debugging.log("Upload error");
				V.Debugging.log(error);
			}
		});	
	}
	
	var onLoadTab = function(tab){
		if(tab=="upload"){
			_onLoadUploadTab();
		}
		if(tab=="url"){
			_onLoadURLTab();
		}
	}	
	
	var _onLoadURLTab = function(){
		contentToAdd = null;
		resetPreview(urlDivId);
		$("#" + urlInputId).val("");
	}
	
	var _onLoadUploadTab = function(){
		contentToAdd = null;
			
		//Hide and reset elements
		var tagList = $("#" + uploadDivId + " .tagList")
		$(tagList).parent().hide();
		$("#" + uploadDivId + ' form' + ' .button').hide();
		$("#" + uploadDivId + " .upload_progress_bar_wrapper").hide();
		$("#" + uploadDivId + " input[name='document[file]']").val(""); 
		_resetUploadFields();
			
		V.Editor.API.requestTags(_onTagsReceived)
	}
	
	var _resetUploadFields = function(){
		var bar = $("#" + uploadDivId + " .upload_progress_bar");
		var percent = $("#" + uploadDivId + " .upload_progress_bar_percent");

		bar.width('0%');
		percent.html('0%');
		resetPreview(uploadDivId)

		var tagList = $("#" + uploadDivId + " .tagList")
		if($(tagList)[0].children.length!==0){
			$(tagList).tagit("reset")
		}
	}
   
	var _onTagsReceived = function(data){
		var tagList = $("#" + uploadDivId + " .tagList");

		
		if ($(tagList).children().length == 0){
			// //Insert the three first tags. //DEPRECATED
			// $.each(data, function(index, tag) {
			//   if(index==3){
			//     return false; //break the bucle
			//   }
			//   $(tagList).append("<li>" + tag + "</li>")
			// });

			$(tagList).tagit({tagSource:data, sortable:true, maxLength:15, maxTags:8 , 
			watermarkAllowMessage: V.Editor.I18n.getTrans("i.AddTags"), watermarkDenyMessage: V.Editor.I18n.getTrans("i.limitReached")});
		}
	}
	
	
	var processResponse = function(response){
		try  {
			var jsonResponse = JSON.parse(response)
			if(jsonResponse.src){
				if (V.Police.validateObject(jsonResponse.src)[0]) {
				  drawPreview(uploadDivId,jsonResponse.src)
				  contentToAdd = jsonResponse.src
				}
			}
		} catch(e) {
		//No JSON response
		}
	}
	
	
	//Preview generation for load and upload tabs
	var previewBackground;
	
	var drawPreview = function(divId,src){
		previewBackground = $("#" + divId + " .previewimgbox").css("background-image");
		$("#" + divId + " .previewimgbox").css("background-image","none");
		$("#" + divId + " .previewimgbox img.imagePreview").remove();
		var wrapper = renderObjectPreview(src)
		if($("#" + divId + " .previewimgbox .objectPreview").length>0){
			$("#" + divId + " .previewimgbox .objectPreview").remove();
		}
		$("#" + divId + " .previewimgbox").append(wrapper);
		$("#" + divId + " .previewimgbox button").show();
		$("#" + divId + " .documentblank").addClass("documentblank_extraMargin")
	}
	
	var resetPreview = function(divId){
		$("#" + divId + " .previewimgbox button").hide()
		$("#" + divId + " .previewimgbox img.imagePreview").remove();
		$("#" + divId + " .previewimgbox .objectPreview").remove();
		if (previewBackground) {
			$("#" + divId + " .previewimgbox").css("background-image", previewBackground);
		}
		$("#" + divId + " .documentblank").removeClass("documentblank_extraMargin")
	}
	
	var drawPreviewElement = function(){
		drawPreviewObject(contentToAdd);
	}
	
	var drawPreviewObject = function(content){
		if(content){
			drawObject(content);
			$.fancybox.close();
		}
	}


	///////////////////////////////////////
	/// OBJECT RESIZING
	///////////////////////////////////////
	
	/*
	* Resize object and its wrapper automatically
	*/
	var resizeObject = function(id,newWidth){
		var parent = $("#" + id).parent();
		var aspectRatio = $("#" + id).width()/$("#" + id).height();

		var newWrapperHeight = Math.round(newWidth/aspectRatio);
		var newWrapperWidth = Math.round(newWidth);
		$(parent).width(newWrapperWidth);
		$(parent).height(newWrapperHeight);

		var zoom = V.Utils.getZoomFromStyle( $("#" + id).attr("style"));

		if(zoom!=1){
			newWidth = newWidth/zoom;
			var newHeight = Math.round(newWidth/aspectRatio);
			newWidth = Math.round(newWidth);
		} else {
			var newHeight = newWrapperHeight;
			var newWidth = newWrapperWidth;
		}
			
		$("#" + id).width(newWidth);
		$("#" + id).height(newHeight);
	}
	
	
	/*
	 * Resize object and its wrapper automatically
	 */
	var _adjustWrapperOfObject = function(objectID, current_area){
		var proportion = $("#"+objectID).height()/$("#"+objectID).width();

		var maxWidth = current_area.width();
		var maxHeight = current_area.height();

		var width = $("#"+objectID).width();
		var height = $("#"+objectID).height();

		if(width > maxWidth){
			$("#"+objectID).width(maxWidth);
			$("#"+objectID).height(width*proportion);
			width = maxWidth;
			height = $("#"+objectID).height();
		}

		if(height > maxHeight){
			$("#"+objectID).height(maxHeight);
			$("#"+objectID).width(height/proportion);
			width = $("#"+objectID).width();
			height = maxHeight;
		}

		var wrapper = $("#"+objectID).parent();
		if($(wrapper).hasClass("object_wrapper")){
			$(wrapper).height($("#"+objectID).height());
			$(wrapper).width($("#"+objectID).width());
		}
	}
	
	
	
	/*
	 * Resize object to fix in its wrapper
	 */
	var autofixWrapperedObjectAfterZoom = function(object,zoom){
		var wrapper = $(object).parent();
		$(object).height($(wrapper).height()/zoom);
		$(object).width($(wrapper).width()/zoom);
	}
	
	///////////////////////////////////////
	/// OBJECT DRAW: PREVIEWS
	///////////////////////////////////////
	
	var renderObjectPreview = function(object){
		var objectInfo = V.Object.getObjectInfo(object);

		switch (objectInfo.wrapper) {
			case null:
				//Draw object preview from source
				switch (objectInfo.type) {			
					case "image":
						return "<img class='imagePreview' src='" + object + "'></img>"
						break;

					case "swf":
						return "<embed class='objectPreview' src='" + object + "' wmode='opaque' ></embed>"
						break;

					case "pdf":
						return V.Editor.Object.PDF.generatePreviewWrapperForPdf(object);
						break;
					  
					case "youtube":
						return V.Editor.Video.Youtube.generatePreviewWrapperForYoutubeVideoUrl(object);
						break;

					case "HTML5":
						return V.Editor.Video.HTML5.renderVideoFromSources([object]);
						break;
						
					case "web":
						return V.Editor.Object.Web.generatePreviewWrapperForWeb(object);
						break;

					default:
						V.Debugging.log("Unrecognized object source type")
						break;
				}
				break;

			case "EMBED":
				return _genericWrapperPreview(object)
				break;

			case "OBJECT":
				return _genericWrapperPreview(object)
				break;

			case "IFRAME":
				return _genericWrapperPreview(object)
				break;

			default:
				V.Debugging.log("Unrecognized object wrapper: " + objectInfo.wrapper)
				break;
		}
	}
	
	var _genericWrapperPreview = function(object){
		var wrapperPreview = $(object);
		$(wrapperPreview).addClass('objectPreview')
		$(wrapperPreview).attr('wmode','opaque')
		$(wrapperPreview).removeAttr('width')
		$(wrapperPreview).removeAttr('height')
		return wrapperPreview;
	}
	
	
	
	///////////////////////////////////////
	/// OBJECT DRAW: Draw objects in slides
	///////////////////////////////////////
	
   /**
	* Returns a object prepared to draw.   * 
	* param area: optional param indicating the area to add the object, used for editing presentations
	* param style: optional param with the style, used in editing presentation
	*/
	var drawObject = function(object, area, style, zoomInStyle){	
		if(!V.Police.validateObject(object)[0]){
			return;
		}

		var current_area;
		var object_style = "";
		if(area){
			current_area = area;
		} else {
			current_area = V.Editor.getCurrentArea();
		}
		if(style){
			object_style = style;
		}
		
		var objectInfo = V.Object.getObjectInfo(object);
		switch (objectInfo.wrapper) {
			case null:
				//Draw object from source
				switch (objectInfo.type) {
					case "image":
						V.Editor.Image.drawImage(object);
						break;
					case "swf":
						V.Editor.Object.Flash.drawFlashObjectWithSource(object, object_style);
						break;
					case "pdf":
						V.Editor.Object.drawObject(V.Editor.Object.PDF.generateWrapperForPdf(object));
						break;
					case "youtube":
						V.Editor.Object.drawObject(V.Editor.Video.Youtube.generateWrapperForYoutubeVideoUrl(object));
						break;
					case "HTML5":
						V.Editor.Video.HTML5.drawVideoWithUrl(object);
						break;
					case "web":
						V.Editor.Object.drawObject(V.Editor.Object.Web.generateWrapperForWeb(object));
						break;
					default:
						V.Debugging.log("Unrecognized object source type: " + objectInfo.type)
						break;
				}
				break;

			case "EMBED":
				drawObjectWithWrapper(object, current_area, object_style);
				break;

			case "OBJECT":
				drawObjectWithWrapper(object, current_area, object_style);
				break;

			case "IFRAME":
				drawObjectWithWrapper(object, current_area, object_style, zoomInStyle);
				break;

			default:
				V.Debugging.log("Unrecognized object wrapper: " + objectInfo.wrapper)
				break;
		}
		//finally load the tools in the toolbar
		V.Editor.Tools.loadToolsForZone(current_area);
	}
	
	/**
	 * param style: optional param with the style, used in editing presentation
	 */
	var drawObjectWithWrapper = function(wrapper, current_area, style, zoomInStyle){
		var template = V.Editor.getTemplate(current_area);
		var nextWrapperId = V.Utils.getId();
		var idToDrag = "draggable" + nextWrapperId;
		var idToResize = "resizable" + nextWrapperId;
		current_area.attr('type', 'object');
		var wrapperDiv = document.createElement('div');
		wrapperDiv.setAttribute('id', idToDrag);
		wrapperDiv.setAttribute('draggable', true);
		if(style){
			wrapperDiv.setAttribute('style', style);
		}
		$(wrapperDiv).addClass('object_wrapper');

		var wrapperTag = $(wrapper);
		$(wrapperTag).attr('id', idToResize);
		$(wrapperTag).css('pointer-events', "none");
		$(wrapperTag).attr('class', template + "_object");
		$(wrapperTag).attr('wmode', "opaque");

		$(current_area).html("");
		$(current_area).append(wrapperDiv);

		V.Editor.addDeleteButton($(current_area));
			
		$(wrapperDiv).append(wrapperTag);
		
		$("#" + idToDrag).draggable({
			cursor : "move"
		});

		_adjustWrapperOfObject(idToResize, current_area);

		//Add toolbar
		V.Editor.Tools.loadToolbarForObject(wrapper);

		if(zoomInStyle){
			$(wrapperTag).attr('style', zoomInStyle);
			V.ObjectPlayer.adjustDimensionsAfterZoom($(wrapperTag));
		}
	
	};
	
	
	return {
		init							: init,
		onLoadTab 						: onLoadTab,
		drawObject						: drawObject,
		renderObjectPreview 			: renderObjectPreview,
		resizeObject 					: resizeObject,
		autofixWrapperedObjectAfterZoom : autofixWrapperedObjectAfterZoom,
		drawPreview 					: drawPreview,
		resetPreview 					: resetPreview,
		drawPreviewElement				: drawPreviewElement,
		drawPreviewObject				: drawPreviewObject
	};

}) (VISH, jQuery);
