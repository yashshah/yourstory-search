var search_query;
var appbase_app = function(){
	var $this = this;
	return {
		initialize:initialize
	};

	function initialize(options){

		//Initialize Variables Start
		$this.default_options = {
			title:'Blazing fast search on your Documentation',
			input_placeholder:'search here',
			logo:'images/Appbase.png',
			abbr:'appbase_',
			selector:'.appbase_external_search'
		};
		$this.variables = variables();
		$this.url = $this.variables.URL;
		$this.appbase_total = 0;
		$this.appbase_increment = 20;
		$this.size = $this.appbase_increment;
		$this.appbase_xhr_flag = true;
		$this.search_payload = $this.variables.SEARCH_PAYLOAD();
		    $.ajaxSetup({
			    crossDomain: true,
			    xhrFields: {
			        withCredentials: true
			    }
			});
		    //Initialize Variables End

		    //Bloodhound Start
		    var engine_variable = variables().ENGINE();
		    engine_variable['remote']['transform'] = function(response) {
	          console.log(response);
	          if (response.hits.hits.length > 0) {
	            console.log(response.hits.total);
	            $this.appbase_total = response.hits.total;
	            $(".appbase_total_info").html('Showing 1-'+response.hits.hits.length+' of '+response.hits.total + " for \""+$('.appbase_input').eq(1).val()+"\"");
	            return $.map(response.hits.hits, function(hit) {
	              return hit;
	            });
	          } else {
	            $("#search-title").text("No Results found");
	          }
	          // if(typeof callback != 'undefined')
	          //   callback();
	        }

		    //$this.engine = new Bloodhound(engine_variable);

		    $this.engine = new Bloodhound({
       name: 'history',
       limit: 100,
       datumTokenizer: function (datum) { return Bloodhound.tokenizers.whitespace(datum); },
       queryTokenizer: Bloodhound.tokenizers.whitespace,
       remote: {

           url: $this.url,
          //  url: 'http://localhost:9200/digitalocean/article/_search',
           // he time interval in milliseconds that will be used by rateLimitBy. Defaults to 300
           rateLimitWait: 300,
            // Function that provides a hook to allow you to prepare the settings object passed to transport when a request is about to be made.
            // The function signature should be prepare(query, settings), where query is the query #search was called with
            // and settings is the default settings object created internally by the Bloodhound instance. The prepare function should return a settings object.
           prepare: function (query, settings) {
							 $('.appbase_input').on('input',function(e){
						      if($('.appbase_input').val() == ''){
						 			 	$(".appbase_total_info").html("");
						      }
						   });

               settings.type = "POST";
               settings.xhrFields= {
                 withCredentials: true
               };
               settings.headers = {
                 "Authorization": "Basic " + btoa("9Y5FRKQBx:5134e787-fb21-4acd-8efa-a19663a9e08e")
               };
               settings.contentType = "application/json; charset=UTF-8";
               search_payload = $this.search_payload;
              search_payload.query.multi_match.query = query;
							search_query = query;
							if (query.toString().indexOf("_index")!=-1)
							{	$('.appbase_input').val("");
						}
               settings.data = JSON.stringify(search_payload);
               return settings;
           },
           transform: function(response) {
              if (response.hits.hits.length > 0) {
	            $this.appbase_total = response.hits.total;
	            $(".appbase_total_info").html('Showing 1-'+response.hits.hits.length+' of '+response.hits.total + " for \""+$('.appbase_input').eq(1).val()+"\""+ " - in " + response.took + "ms");
	            return $.map(response.hits.hits, function(hit) {
	              return hit;
	            });
	          } else {


							$(".appbase_total_info").text("No Results found");

							console.log("sdfjkhsd")
							search_payloa = {
					      "from": 0,
					      "size": 10,
					      "fields": ["link"],
					      "query": {
					        "multi_match": {
					          "query": search_query,
					          "fields": [
					            "title^3", "body"
					          ],
										"operator": "and",
										"fuzziness": "AUTO"
					        }
					      },
					      "highlight": {
					        "fields": {
					          "body": {
					            "fragment_size": 100,
					            "number_of_fragments": 2,
					            "no_match_size": 180
					          },
					          "title": {
					            "fragment_size": 500,
					            "no_match_size": 500
					          }
					        }
					      }
					    };
							$.ajax({
							  type: "POST",
					            beforeSend: function (request)
					            {
					                request.setRequestHeader("Authorization", "Basic " + btoa("9Y5FRKQBx:5134e787-fb21-4acd-8efa-a19663a9e08e"));
													console.log("kjsdhflkjasdhf")
					            },
							  url: $this.url,
							  dataType:'json',
						      contentType:"application/json",
							  data:  JSON.stringify(search_payloa),
							  success: function(full_data){
							  	var hits = full_data.hits.hits;
								$this.appbase_increment += hits.length;
							  	$(".appbase_total_info").html('Showing 1-'+$this.appbase_increment+' of '+$this.appbase_total + " for \""+$('.appbase_input').eq(1).val()+"\"" + "- in " + full_data.took + "ms");

							  	for(var i=0; i< hits.length; i++)
							  	{
							  		var data = hits[i];
							  		var small_link = $('<span>').addClass('small_link').html(data.highlight.title);
							  		var small_description = $('<p>').addClass('small_description').html(data.highlight.body.join('...')+'...');
							  		var single_record = $('<a>').attr({'class':'record_link'}).append(small_link).append(small_description);

							  		//var single_record = '<div><a cla href="'+ data.fields.link +'">' + data.highlight.title + '</a><p> ' + data.highlight.body.join('...') + '...</p></div>';
						      		var tt_record = $('<div>').addClass('tt-suggestion tt-selectable').html(single_record);
						      		$('.tt-menu .tt-dataset.tt-dataset-my-dataset').append(tt_record);
						      	}
						      	$this.appbase_xhr_flag = true;
							  }
							});
	          }
	          // if(typeof callback != 'undefined')
	          //   callback();
           }
       }
   });

			//Bloodhound End

			//Fire CreateHtml
			var options = $.extend($this.default_options, options);
			createHtml(options);

			//CreateHtml Start
			function createHtml(obj){
				var abbr = obj.abbr;
				var title = $('<h1>').addClass(abbr+'title').html(obj.title);
				var	input_box = $('<input>').addClass(abbr+'input').attr({'type':'text', 'placeholder':obj.input_placeholder});
				var	app_logo = $('<img>').addClass(abbr+'logo').attr({'src':obj.logo});
				var	search_box = $('<div>').addClass(abbr+'search_box').append(input_box).append(app_logo);
				var	search_box_container = $('<div>').addClass(abbr+'search_box').append(search_box);
				var	modal_content = $('<div>').addClass(abbr+'modal_content').append(search_box_container);
				var overlay = $('<div>').addClass(abbr+'overlay');
				var	modal = $('<div>').addClass(abbr+'modal').append(modal_content).append(overlay);
				$('body').append(modal);

				html_events(obj, modal, overlay);
			};

			function html_size(obj, modal){
				function appbase_resize(){
					var win_height = $(window).height();
					var modal_height = win_height - 150;
					var tt_height = modal_height - $('.'+obj.abbr+'input').height() - 50;
					$('.tt-menu').height(tt_height);
					$(modal).find('.'+obj.abbr+'modal_content').height(modal_height);
				}
				$(window).resize(function(){
					appbase_resize();
				});
				appbase_resize();
			}

			function html_events(obj, modal, overlay){
				$(modal).find('.'+obj.abbr+'input').typeahead({
				  minLength: 2,
				  highlight: true,
				  limit: 100,
				  change:function(){
				  	alert('changed');
				  }
				},
				{
				  name: 'my-dataset',
				  limit: 100,
				  source: $this.engine.ttAdapter(),
				  templates: {
				      suggestion: function(data){
				        // return '<div><h4><a href="https://www.digitalocean.com/community/tutorials/'+ data.fields.link + '">' + data.fields.title + '</a></h4><p> ' + "Abhi ke liye yeh hi body se kaam chala  lo baad mein kuch aur daal denge beta - Yo - I am loving this typing" + '</p></div>';
				      var small_link = $('<span>').addClass('small_link').html(data.highlight.title);
				  		var small_description = $('<p>').addClass('small_description').html(data.highlight.body.join('...')+'...');
				  		var single_record = $('<a>').attr({'class':'record_link','target':'_blank', 'href':'http://'+data.fields.link.toString().substring(0,data.fields.link.toString().length-10)}).append(small_link).append(small_description);
				        return single_record;
				      }
				  }
				});
				$(modal).find('.'+obj.abbr+'input').bind('typeahead:select', function(ev, suggestion) {
				  $(ev).preventDefault();
				  console.log('Selection: ' + suggestion);
				});

				var total_info = $('<span>').addClass(obj.abbr+'total_info').html('No Results found');
				$('.tt-menu').prepend(total_info);

				html_size(obj, modal);

				$(obj.selector).on('keyup',function(){
					var input_val = $(this).val();
					$(modal).find('.'+obj.abbr+'input').val(input_val);
					$(modal).fadeIn(300);
					$(overlay).show();
					$(modal).find('.'+obj.abbr+'input').focus();
					$(this).val('');
				});
				$(document).keyup(function(e){
					if (e.keyCode == 27){
						$(modal).fadeOut(300);
						$(overlay).fadeOut(300);
					}
				});
				$(overlay).on('click',function(){
					$(modal).fadeOut(500);
					$(overlay).fadeOut(500);
				});

				$('.tt-menu').on('scroll', function() {
			        if($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
			        	if($this.appbase_total != 0 && $this.appbase_total > $this.appbase_increment && $this.appbase_xhr_flag){
			        		scroll_xhr();
			        	}
			        }
			    });


				function scroll_xhr(){
					$this.appbase_xhr_flag = false;
					$this.search_payload.query.multi_match.query = $('.'+obj.abbr+'input').eq(1).val();
					$this.search_payload.from = $this.appbase_increment;
					$.ajax({
					  type: "POST",
			            beforeSend: function (request)
			            {
			                request.setRequestHeader("Authorization", "Basic " + btoa("9Y5FRKQBx:5134e787-fb21-4acd-8efa-a19663a9e08e"));
			            },
					  url: $this.url,
					  dataType:'json',
				      contentType:"application/json",
					  data:  JSON.stringify($this.search_payload),
					  success: function(full_data){
					  	var hits = full_data.hits.hits;
						$this.appbase_increment += hits.length;
					  	$(".appbase_total_info").html('Showing 1-'+$this.appbase_increment+' of '+$this.appbase_total + " for \""+$('.appbase_input').eq(1).val()+"\"" + "- in " + full_data.took + "ms");

					  	for(var i=0; i< hits.length; i++)
					  	{
					  		var data = hits[i];
					  		var small_link = $('<span>').addClass('small_link').text(data.highlight.title);
					  		var small_description = $('<p>').addClass('small_description').text(data.highlight.body.join('...')+'...');
					  		var single_record = $('<a>').attr({'class':'record_link'}).append(small_link).append(small_description);

					  		//var single_record = '<div><a cla href="'+ data.fields.link +'">' + data.highlight.title + '</a><p> ' + data.highlight.body.join('...') + '...</p></div>';
				      		var tt_record = $('<div>').addClass('tt-suggestion tt-selectable').html(single_record);
				      		$('.tt-menu .tt-dataset.tt-dataset-my-dataset').append(tt_record);
				      	}
				      	$this.appbase_xhr_flag = true;
					  }
					});
				}

			}
			//CreateHtml End



	}
}

var Loader = function () { }
Loader.prototype = {
    require: function (scripts, callback) {
        this.loadCount      = 0;
        this.totalRequired  = scripts.length;
        this.callback       = callback;

        for (var i = 0; i < scripts.length; i++) {
        	var split_name = scripts[i].split('.');
        	if(split_name[split_name.length-1] == 'js')
            	this.writeScript(scripts[i]);
            if(split_name[split_name.length-1] == 'css')
            	this.writeStylesheet(scripts[i]);
        }
    },
    loaded: function (evt) {
        this.loadCount++;

        if (this.loadCount == this.totalRequired && typeof this.callback == 'function') this.callback.call();
    },
    writeScript: function (src) {
        var self = this;
        var s = document.createElement('script');
        s.type = "text/javascript";
        s.async = true;
        s.src = src;
        s.addEventListener('load', function (e) { self.loaded(e); }, false);
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(s);
    },
    writeStylesheet: function (src) {
        var self = this;
        var s = document.createElement('link');
        s.type = "text/css";
        s.rel = "stylesheet";
        s.href = src;
        s.addEventListener('load', function (e) { self.loaded(e); }, false);
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(s);
    }
}

var jquery_js = new Loader();
jquery_js.require([
    "css/client.css",
    "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"],
    function() {
		var typeahead_js = new Loader();
		typeahead_js.require([
		    "http://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.11.1/typeahead.bundle.min.js",
		    "js/variable.js"],
		    function() {
		    	 var appbase = new appbase_app();
			      appbase.initialize({
			        title:'Blazing fast search1 on your Documentation',
			        input_placeholder:'search here',
			        logo:'images/Appbase.png',
			        selector:'.appbase_external_search'
			      });
		    });
    });
