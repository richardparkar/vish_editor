VISH.Configuration = (function(V,$,undefined){
  
	var configuration;
	
	var init = function(myConfiguration){ 
		configuration = myConfiguration;
		_initPaths();
	};

	var _initPaths = function(){
		V.ImagesPath = configuration["ImagesPath"];
		V.StylesheetsPath = configuration["StylesheetsPath"];
		V.UploadImagePath = configuration["uploadImagePath"];
		V.UploadObjectPath = configuration["uploadObjectPath"];
		V.UploadPresentationPath = configuration["uploadPresentationPath"];
		V.UploadPDF2PPath = configuration["uploadPDF2PPath"];
		V.SearchLREPath = configuration["SearchLREPath"];
	};
	
	var applyConfiguration = function(){
		if(configuration["presentationSettings"]){
			if(!configuration["presentationTags"]){
				$(".tagBoxUpload").css("display","none");
				$(".tagBoxIntro").css("display","none");
			}
			if(!configuration["presentationThumbnails"]){
				$("#thumbnails_in_excursion_details").css("display","none");
			}
		}
			
		//Vish Apis Enabled
		if(!configuration["VishLives"]){
			$(".addLive").css("display","none");
		}

		if(!configuration["VishRepo"]){
			$("#tab_pic_repo").css("display","none");
			$("#tab_object_repo").css("display","none");
			$("#tab_video_repo").css("display","none");
		}

		if(!configuration["Upload"]){
			$("#tab_pic_upload").css("display","none");
			$("#tab_object_upload").css("display","none");
		}
			
		if(!configuration["Youtube"]){
	      $("#tab_video_youtube").css("display","none");
	    }
			
		if(!configuration["Vimeo"]){
	      $("#tab_video_vimeo").css("display","none");
	    }

	    if(!configuration["LRE"]){
	      $("#tab_pic_lre").css("display","none");
	      $("#tab_object_lre").css("display","none");
	    }
			
		if(!configuration["Flickr"]){
			$("#tab_pic_flikr").css("display","none");
		}

	    //    V.Debugging.log("Configuration completed")
	};
	
	var getConfiguration = function(){
		return configuration;
	}
	
	return {
    	init                : init,
    	applyConfiguration  : applyConfiguration,
		getConfiguration    : getConfiguration
  	};
	
}) (VISH, jQuery);