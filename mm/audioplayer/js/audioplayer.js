/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements an audio player
 * 
 * @compatibility Iphone OS4, Android 3.0, Android 3.1, BlackBerry 7, Windows Phone 7.5
 * @author Jerome GIRAUD
 */
	
/**
 * The event is fired when play is called 
 * 
 * @name wink.mm.AudioPlayer#/audioplayer/events/play
 * 
 * @event
 */

/**
 * The event is fired when pause is called 
 * 
 * @name wink.mm.AudioPlayer#/audioplayer/events/pause
 * 
 * @event
 */
define(['../../../_amd/core'], function(wink)
{
	/** 
	 * @class Implements an audio player
	 * An audio player based on the HTML5 audio tag. It can also read LRC files
	 * The audio player can take several parameters. It takes at least an audio file url but it can also take an LRC file and various parameters to change the player look and behaviour. Use the getDomNode method to add the player to the page
	 * 
	 * @param {object} properties The properties object
	 * @param {object} properties.source The info about the audio file
	 * @param {string} properties.source.type Either 'stream' or 'file'
	 * @param {string} properties.source.url The url of the audio file to load
	 * @param {string} [properties.source.lyrics] The url of the LRC file corresponding to the audio file
	 * @param {integer} [properties.displayControls=1] Specify if the play/pause buttons should be displayed
	 * @param {integer} [properties.displayDuration=1] Display the time left and the duration of the file
	 * @param {integer} [properties.displayCursor=1] Specify if the cursor (to manually navigate through the audio file) should be displayed
	 * @param {integer} [properties.silentSeeking=1] The audio is stopped while the cursor is moved
	 * 
	 * @example
	 * 
	 * var properties =
	 * {
	 * 	source:
	 * 	{
	 * 		type: 'file',
	 * 		url: '../files/myFile.mp3',
	 * 		lyrics: '../files/myLyrics.lrc'
	 * 	},
	 * 	displayControls: 1,
	 * 	displayDuration: 1,
	 * 	displayCursor: 1,
	 * 	silentSeeking: 1
	 * };
	 * 
	 * audioPlayer = new wink.mm.AudioPlayer(properties);
	 * 
	 * $('audio').appendChild(audioPlayer.getDomNode());
	 * 
	 * @see <a href="WINK_ROOT_URL/mm/audioplayer/test/test_audioplayer.html" target="_blank">Test page</a>
	 */
	wink.mm.AudioPlayer = function(properties)
	{
		if (wink.isUndefined(wink.mm.AudioPlayer.singleton))
		{
			/**
			 * Unique identifier
			 * 
			 * @property
			 * @type integer
			 */
			this.uId = wink.getUId();
			
			/**
			 * The current state of the player ("play" or "pause")
			 * 
			 * @property
			 * @type string
			 */
			this.state = this._PAUSE;
			
			/**
			 * Whether the buttons of the player are displayed or not
			 * 
			 * @property
			 * @type integer
			 * @default 1
			 */
			this.displayControls = 1;
			
			/**
			 * Whether the duration of the audio file is displayed or not
			 * 
			 * @property
			 * @type integer
			 * @default 1
			 */
			this.displayDuration = 1;
			
			/**
			 * Whether the progress bar cursor is displayed or not
			 * 
			 * @property
			 * @type integer
			 * @default 1
			 */
			this.displayCursor = 1;
			
			/**
			 * Stops the audio while moving the cursor
			 * 
			 * @property
			 * @type integer
			 * @default 1
			 */
			this.silentSeeking = 1;
			
			/**
			 * The current audio source
			 * 
			 * @property
			 * @type object
			 */
			this.source = {type: undefined, url: undefined, lyrics: undefined}; 
	
			
			this._currentDuration          = null;
			this._currentBuffering         = null;
			this._currentProgress          = null;
			
			this._lyricsReader             = null;
			
			this._fileLoaded               = false;
			
			this._cursorBeginX             = 0;
			this._cursorCurrentX           = 0;
			this._cursorPosition           = 0;
			
			this._cursorDragging           = false;
			
			this._audioNode                = null;
			this._subtitlesNode            = null;
			this._playerNode               = null;
			this._progressNode             = null;
			this._progressBarNode          = null;
			this._progressBar              = null;
			this._bufferingBar             = null;
			this._cursor                   = null;
			this._playPauseButton          = null;
			this._durationNode             = null;
			this._controlsNode             = null;
			this._lyricsNode               = null;
			this._domNode                  = null;
			
			this._resetHandler             = wink.bind(this._reset, this);
			this._onErrorHandler           = wink.bind(this._onError, this);
			this._getLyricsHandler         = wink.bind(this._getLyrics, this);
			this._updateDurationHandler    = wink.bind(this._updateDuration, this);
			this._updateBufferBarHandler   = wink.bind(this._updateBufferBar, this);
			this._updateProgressBarHandler = wink.bind(this._updateProgressBar, this);
			
			wink.mixin(this, properties);
			
			if  ( this._validateProperties() ===  false )return;
			
			this._initProperties();
			this._initDom();
			this._initAudioNode();
			
			
			wink.mm.AudioPlayer.singleton = this;
		} else
		{
			return wink.mm.AudioPlayer.singleton;
		}
	};
	
	wink.mm.AudioPlayer.prototype =
	{
		i18n: {},
		_PLAY: 'play',
		_PAUSE: 'pause',
		
		_STREAM: 'stream',
		_FILE: 'file',
		
		/**
		 * Start playing the current audio file
		 */
		play: function()
		{
			if ( this.source.url == '' ) return;
	
			this.state = this._PLAY;
			
			wink.removeClass(this._playPauseButton, 'w_button_play');
			wink.addClass(this._playPauseButton, 'w_button_pause');
			
			if ( this._cursor.style.display == 'none' && this.displayCursor == 1 && this.source.type != this._STREAM )
			{
				this._cursor.style.display = 'block';
			}
			
			this._audioNode.play();
			
			this._checkDurationValidity();
						
			wink.publish('/audioplayer/events/play', {});
		},
		
		/**
		 * Stop the current audio file play
		 */
		pause: function()
		{
			this.state = this._PAUSE;
	
			wink.removeClass(this._playPauseButton, 'w_button_pause');
			wink.addClass(this._playPauseButton, 'w_button_play');
			
			this._audioNode.pause();
						
			wink.publish('/audioplayer/events/pause', {});
		},
		
		/**
		 * Change the current audio time
		 * 
		 * @param {number} seconds The number of seconds to change (+: forward ; -: rewind)
		 */
		forward: function(seconds)
		{
			this._setDuration(this._audioNode.currentTime + seconds);
			
			this._updateDuration();
			this._updateProgressBar();
		},
		
		/**
		 * Change the current audio source
		 * 
		 * @param {string} type Either 'file' or 'stream'
		 * @param {string} url The file to be played (absolute or relative path)
		 * @param {string} [lyrics] The LRC lyrics associated to the file (if any)
		 */
		changeSource: function(type, url, lyrics)
		{
			this.source.url = url;
			this.source.type = type;
			this.source.lyrics = lyrics;
			
			this._reset();
			this._deleteAudioNode();
			
			this._fileLoaded = false;
			this._durationNode.innerHTML = '';
			this._currentBuffering = 0;
			this._progressBar.style.width = '0%';
			this._bufferingBar.style.width = '0%';
			this._cursor.style.display = 'none';
			
			this._initAudioNode();
		},
		
		/**
		 * Return the dom node containing the audio player
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * reset the audio player
		 */
		_reset: function()
		{
			this._setDuration(0);
			
			this.pause();
			
			this._cursorPosition = 0;
			this._cursor.translate(this._cursorPosition, 0);
			this._updateDuration();
			this._updateProgressBar();
		},
		
		/**
		 * toggle the play/pause button
		 */
		_tooglePlayButton: function()
		{
			if ( this.state == this._PAUSE )
			{
				this.play();
			} else
			{
				this.pause();
			}
		},
		
		/**
		 * update the width of the buffer bar
		 */
		_updateBufferBar: function()
		{
			if ( this.source.type != this._STREAM )
			{
				if ( !wink.isUndefined(this._progressBarNode.clientWidth) && wink.isSet(this._currentDuration) && !this._fileLoaded)
				{
					this._currentBuffering = this._audioNode.buffered.end((this._audioNode.buffered.length - 1));
					this._bufferingBar.style.width = ((this._currentBuffering/this._currentDuration)*100) + '%';
					
					if ( this._currentBuffering == this._currentDuration)
					{
						this._fileLoaded = true;
					}
				}
			}
		},
		
		/**
		 * update the width of the progress bar
		 */
		_updateProgressBar: function()
		{
			this._currentProgress = this._audioNode.currentTime;
			
			if ( this.source.type != this._STREAM )
			{
				if ( !wink.isUndefined(this._progressBarNode.clientWidth) && wink.isSet(this._currentDuration))
				{
					this._progressBar.style.width = ((this._currentProgress/this._currentDuration)*100) + '%';
					
					if ( !this._cursorDragging )
					{
						this._cursor.translate(((this._currentProgress/this._currentDuration)*this._progressBarNode.clientWidth), 0);
						this._cursorCurrentX = (this._currentProgress/this._currentDuration)*this._progressBarNode.clientWidth;
					}
				}
			} 
			
			this._updateDisplay();
		},
		
		/**
		 * set the duration of the audio file
		 * 
		 * @param {number} seconds The time in seconds
		 */
		_setDuration: function(seconds)
		{
			try 
			{ 
				this._audioNode.currentTime = seconds;
				this._updateDuration();
			} catch(e)
			{
				// 'play' was never called
			}
		},
		
		/**
		 * check the duration validity (workaround ie and bb7)
		 */
		_checkDurationValidity: function()
		{
			if(isNaN(this._currentDuration) || this._currentDuration == Infinity)
			{
				this._updateDuration();
			
				if(isNaN(this._currentDuration) || this._currentDuration == Infinity)
				{
					wink.setTimeout(this, '_checkDurationValidity', 500);
				}
			}
		},
		
		/**
		 * retrieve the duration of the audio file
		 */
		_updateDuration: function()
		{
			this._currentDuration = this._audioNode.duration;
		},
		
		/**
		 * Get the lyric at a particular moment in time
		 */
		_getLyrics: function()
		{
			var lyric = this._lyricsReader.getLyric(this._audioNode.currentTime);
			
			this._lyricsNode.innerHTML = lyric;
		},
		
		/**
		 * change the time progress display
		 */
		_updateDisplay: function()
		{
			var currentTime = this._getTranslatedDuration(this._currentProgress);
			
			if ( this.source.type != this._STREAM )
			{
				var totalTime = isNaN(this._currentDuration) ? '--' : this._getTranslatedDuration(this._currentDuration);
				this._durationNode.innerHTML = currentTime + '/' + totalTime;
			} else
			{
				this._durationNode.innerHTML = currentTime;
			}
		},
		
		/**
		 * return the duration translated in a comprehensive language
		 *  
		 * @param {number} duration A duration in milliseconds
		 */
		_getTranslatedDuration: function(duration)
		{
			var s = Math.floor(duration);
			
			if ( s >= 60 )
			{
				var m = Math.floor(s/60);
				return (m + _('minutes', this) + (s-m*60) + _('seconds', this));
			} else
			{
				return (s + _('seconds', this));
			}
		},
		
		/**
		 * Convert the position of the cursor to its time value
		 * 
		 * @param {number} partial The cursor position
		 * @param {number} total The progress bar container width
		 * 
		 * @returns {number} The duration corresponding to the cursor position
		 */
		_convert: function(partial, total)
		{
			return ((partial/total) * this._currentDuration);
		},
		
		/**
		 * start dragging the cursor
		 * 
		 * @param {wink.ux.Event} event The touch start event
		 */
		_touchStart: function(event)
		{
			this._cursorBeginX = event.x;
			this._cursorDragging = true;
			
			if ( this.state == this._PLAY && this.silentSeeking == 1 )
			{
				this._audioNode.pause();
			}
		},
		
		/**
		 * drag the cursor
		 * 
		 * @param {wink.ux.Event} event The touch move event
		 */
		_touchMove: function(event)
		{
			if ( isNaN(this._audioNode.duration) )
			{
				return;
			}
			
			this._cursorPosition = this._cursorCurrentX + event.x - this._cursorBeginX;
			
			if ( (this._cursorCurrentX + event.x - this._cursorBeginX) >= 0 && (this._cursorCurrentX + event.x - this._cursorBeginX) <= this._progressBarNode.clientWidth)
			{
				this._cursor.translate(this._cursorPosition, 0);
				this._setDuration(this._convert(this._cursorPosition, this._progressBarNode.clientWidth));
				this._updateProgressBar();
			}
		},
		
		/**
		 * stop dragging the cursor
		 * 
		 * @param {wink.ux.Event} event The touch end event
		 */
		_touchEnd: function(event)
		{
			this._cursorCurrentX = this._cursorPosition;
			this._cursorDragging = false;
			
			if ( this.state == this._PLAY  && this.silentSeeking == 1)
			{
				this._audioNode.play();
			}
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			// Check the url parameter
			if ( wink.isUndefined(this.source.url))
			{
				wink.log('[AudioPlayer] The source.url property must be set');
				return false;
			}
			
			// Check the type parameter
			if ( wink.isUndefined(this.source.type) || ( this.source.type != this._STREAM && this.source.type != this._FILE) )
			{
				wink.log('[AudioPlayer] The source.type property must be set and equal to either "stream" or "file"');
				return false;
			}
			
			// Check the controls parameter
			if ( !wink.isInteger(this.displayControls) || (this.displayControls != 0 && this.displayControls != 1) )
			{
				wink.log('[AudioPlayer] The property displayControls must be either 0 or 1');
				return false;
			}
			
			// Check the duration parameter
			if ( !wink.isInteger(this.displayDuration) || (this.displayDuration != 0 && this.displayDuration != 1) )
			{
				wink.log('[AudioPlayer] The property displayDuration must be either 0 or 1');
				return false;
			}
			
			// Check the cursor parameter
			if ( !wink.isInteger(this.displayCursor) || (this.displayCursor != 0 && this.displayCursor != 1) )
			{
				wink.log('[AudioPlayer] The property displayCursor must be either 0 or 1');
				return false;
			}
			
			// Check the silent seeking parameter
			if ( !wink.isInteger(this.silentSeeking) || (this.silentSeeking != 0 && this.silentSeeking != 1) )
			{
				wink.log('[AudioPlayer] The property silentSeeking must be either 0 or 1');
				return false;
			}
		},
		
		/**
		 * Initialize the lyrics properties
		 */
		_initProperties: function()
		{
			if ( wink.isSet(this.source.lyrics) )
			{
				this._lyricsReader = new wink.mm.LRCReader({file: this.source.lyrics});
			}
		},
		
		/**
		 * Initialze the audio tag
		 */
		_initAudioNode: function()
		{
			this._audioNode = document.createElement('audio');
			this._audioNode.src = this.source.url;
			
			this._audioNode.addEventListener('loadedmetadata', this._updateDurationHandler, false);
			this._audioNode.addEventListener('canplay', this._updateDurationHandler, false);
			this._audioNode.addEventListener('progress', this._updateBufferBarHandler, false);
			this._audioNode.addEventListener('timeupdate', this._updateProgressBarHandler, false);
			this._audioNode.addEventListener('ended', this._resetHandler, false);
			this._audioNode.addEventListener('error', this._onErrorHandler, false);
			
			if ( wink.isSet(this.source.lyrics) )
			{
				this._audioNode.addEventListener('timeupdate', this._getLyricsHandler, false);
				this._lyricsReader = new wink.mm.LRCReader({file: this.source.lyrics});
				this._lyricsNode.style.display = 'block';
			} else
			{
				this._lyricsNode.style.display = 'none';
			}
	
	
			this._audioNode.style.height = '0';
			this._audioNode.style.width = '0';
			
			document.body.appendChild(this._audioNode);
		},
		
		/**
		 * Removes the audio tag from the page
		 */
		_deleteAudioNode: function()
		{
			this._audioNode.removeEventListener('loadedmetadata', this._updateDurationHandler, false);
			this._audioNode.removeEventListener('canplay', this._updateDurationHandler, false);
			this._audioNode.removeEventListener('progress', this._updateBufferBarHandler, false);
			this._audioNode.removeEventListener('timeupdate', this._updateProgressBarHandler, false);
			this._audioNode.removeEventListener('ended', this._resetHandler, false);
			this._audioNode.removeEventListener('error', this._onErrorHandler, false);
			
			if ( wink.isSet(this.source.lyrics) )
			{
				this._audioNode.removeEventListener('timeupdate', this._getLyricsHandler, false);
			}
			
			document.body.removeChild(this._audioNode);
			delete this._audioNode;
		},
		
		/**
		 * Initialize the AudioPlayer DOM nodes
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			
			this._domNode.className = 'w_box ap_container w_radius w_bg_dark';
			
			this._playerNode = document.createElement('div');
			this._progressNode = document.createElement('div');
			this._progressBarNode = document.createElement('div');
			this._progressBar = document.createElement('div');
			this._bufferingBar = document.createElement('div');
			this._cursor = document.createElement('div');
			
			this._playerNode.className = 'w_layout_box' + (wink.ua.isIE ? ' no_flex_box' : '');
			this._progressNode.className = 'w_box w_expand ap_progress_container';
			this._progressBarNode.className = 'w_bar w_radius w_border ap_progress';
			this._progressBar.className = 'w_bar_progress w_radius';
			this._bufferingBar.className = 'w_bar_progress w_radius ap_buffering_bar';
			this._cursor.className = 'w_icon w_button_handle ap_cursor';
			
			this._cursor.style.display = 'none';
			
			this._controlsNode = document.createElement('div');
			this._durationNode = document.createElement('div');
			this._playPauseButton = document.createElement('input');
			
			this._controlsNode.className = 'ap_controls';
			this._durationNode.className = 'ap_duration';
			this._playPauseButton.className = 'w_icon w_button_play';
	
			this._playPauseButton.type = "button";
			
			if ( wink.ua.isIOS)
			{
				this._playPauseButton.style.position = "relative";
				this._playPauseButton.style.top = "-4px";
			}
			
			this._playPauseButton.onclick = wink.bind(this._tooglePlayButton, this);
			
			this._lyricsNode = document.createElement('div');
			
			this._lyricsNode.className = 'ap_lyrics';
			
			this._progressBarNode.appendChild(this._progressBar);
			this._progressBarNode.appendChild(this._bufferingBar);
			this._progressBarNode.appendChild(this._cursor);
			
			this._progressNode.appendChild(this._progressBarNode);
			
			this._controlsNode.appendChild(this._playPauseButton);
			
			this._playerNode.appendChild(this._controlsNode);
			this._playerNode.appendChild(this._progressNode);
			this._playerNode.appendChild(this._durationNode);
			
			this._domNode.appendChild(this._playerNode);
			this._domNode.appendChild(this._lyricsNode);
			
			if ( this.displayDuration == 0 )
			{
				this._durationNode.style.display = 'none';
			}
			
			if ( this.displayControls == 0 )
			{
				this._controlsNode.style.display = 'none';
			}
	
			if ( this.displayCursor == 1 )
			{	
				wink.ux.touch.addListener(this._cursor, "start", { context: this, method: "_touchStart", arguments: null }, { preventDefault: true });
				wink.ux.touch.addListener(this._progressBarNode, "move", { context: this, method: "_touchMove", arguments: null }, { preventDefault: true });
				wink.ux.touch.addListener(this._cursor, "end", { context: this, method: "_touchEnd", arguments: null }, { preventDefault: true });
			}
			
			window.addEventListener("orientationchange", wink.bind(this._updateProgressBar, this), false);
		},
		
		/**
		 * In case of loading error
		 */
		_onError: function()
		{
			wink.log('[AudioPlayer] An error occured while loading the audio feed');
		}
	};
	
	/**
	 * @class Implements a LRC file reader
	 * 
	 * @param {object} properties The properties object
	 * @param {string} properties.file The path to the lyrics file to be read
	 */
	wink.mm.LRCReader = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		/**
		 * The title of the lyrics
		 * 
		 * @property title
		 * @type string
		 */
		this.title = null;
		
		/**
		 * The name of the artist
		 * 
		 * @property artist
		 * @type string
		 */
		this.artist = null;
		
		/**
		 * The name of the album
		 * 
		 * @property album
		 * @type string
		 */
		this.album = null;
		
		/**
		 * The player or editor that creates LRC file
		 * 
		 * @property editor
		 * @type string
		 */
		this.editor = null;
		
		/**
		 * The version of the program which edited the lyrics
		 * 
		 * @property version
		 * @type string
		 */
		this.version = null;
		
		/**
		 * The creator of the LRC file
		 * 
		 * @property creator
		 * @type string
		 */
		this.creator = null;
		
		/**
		 * The overall timestamp adjustment in milliseconds
		 * 
		 * @property offset
		 * @type string
		 */
		this.offset = null;
		
		/**
		 * The lyrics
		 * 
		 * @property lyricsTab
		 * @type array
		 */
		this.lyricsTab = [];
	
		
		this._isReady    = false;
			
		this._properties = properties;
		
		this._file = null;
		
		if  ( this._validateProperties() ===  false )return;
		
		this._initProperties();
		this._load();
		
	};
	
	wink.mm.LRCReader.prototype =
	{
		/**
		 * Return the current lyric
		 * 
		 * @param {number} time The position of the audio file in millisecond
		 * 
		 * @returns {string} The lyrics for this position
		 */
		getLyric: function(time)
		{
			time = wink.math.round(time, 1);
			var lyric = this.lyricsTab['"' + time + '"'];
			
			if (!wink.isUndefined(lyric))
			{
				return lyric;
			} else
			{
				return '';
			}
		},
		
		/**
		 * Test if the LRC line contains the title of the song
		 * 
		 * @param {string} str A LRC line
		 * 
		 * @returns {string} The title
		 */
		_checkTitle: function(str)
		{
			var matches = str.match(/^(\[ti:)(.*)(\])/i);
	
			if ( matches != null )
			{
				return matches[2];
			} else
			{
				return matches;
			}
		},
	
		/**
		 * Test if the LRC line contains the artist of the song
		 * 
		 * @param {string} str A LRC line
		 * 
		 * @returns {string} The artist
		 */
		_checkArtist: function(str)
		{
			var matches = str.match(/^(\[ar:)(.*)(\])/i);
	
			if ( matches != null )
			{
				return matches[2];
			} else
			{
				return matches;
			}
		},
	
		/**
		 * Test if the LRC line contains the album name
		 * 
		 * @param {string} str A LRC line
		 * 
		 * @returns {string} The album
		 */
		_checkAlbum: function(str)
		{
			var matches = str.match(/^(\[al:)(.*)(\])/i);
	
			if ( matches != null )
			{
				return matches[2];
			} else
			{
				return matches;
			}
		},
		
		/**
		 * Test if the LRC line contains the name of the editor of the LRC file
		 * 
		 * @param {string} str A LRC line
		 * 
		 * @returns {string} The editor
		 */
		_checkEditor: function(str)
		{
			var matches = str.match(/^(\[re:)(.*)(\])/i);
	
			if ( matches != null )
			{
				return matches[2];
			} else
			{
				return matches;
			}
		},
	
		/**
		 * Test if the LRC line contains the version of the software which edited the LRC file
		 * 
		 * @param {string} str A LRC line
		 * 
		 * @returns {string} The version
		 */
		_checkVersion: function(str)
		{
			var matches = str.match(/^(\[ve:)(.*)(\])/i);
	
			if ( matches != null )
			{
				return matches[2];
			} else
			{
				return matches;
			}
		},
		
		/**
		 * Test if the LRC line contains the name of the person who created the LRC file
		 * 
		 * @param {string} str A LRC line
		 * 
		 * @returns {string} The creator
		 */
		_checkCreator: function(str)
		{
			var matches = str.match(/^(\[by:)(.*)(\])/i);
	
			if ( matches != null )
			{
				return matches[2];
			} else
			{
				return matches;
			}
		},
	
		/**
		 * Test if the LRC line contains an offset
		 * 
		 * @param {string} str A LRC line
		 * 
		 * @returns {string} The offset
		 */
		_checkOffset: function(str)
		{
			var matches = str.match(/^(\[offset:)(.*)(\])/i);
			
			if ( matches != null )
			{
				return matches[2];
			} else
			{
				return matches;
			}
		},
	
		/**
		 * Test if the LRC line contains a lyric
		 * 
		 * @param {string} str A LRC line
		 * 
		 * @returns {string} The lyrics
		 */
		_checkLyrics: function(str)
		{
			var matches = str.match(/^(\[)(\d*)(:)(.*)(\])(.*)/i);
	
			if ( matches != null )
			{
				var time = parseInt(matches[2])*60 + parseFloat(matches[4]);
				
				if (this.offset != null )
				{
					time = time - parseInt(this.offset)/1000;
				}
				
				return { time: time, lyric: matches[6] };
			} else
			{
				return matches;
			}
		},
		
		/**
		 * Retrieve the position of the lyrics
		 */
		_treatLyrics: function()
		{
			var tab = [];
			var l = this.lyricsTab.length;
			
			for ( var i=0; i<l-1; i++ )
			{
				var t1 = this.lyricsTab[i].time;
				var l1 = this.lyricsTab[i].lyric;
				
				var t2 = this.lyricsTab[i+1].time;
				var l2 = this.lyricsTab[i+1].lyric;
				
				t1 = wink.math.round(t1, 1);
				t2 = wink.math.round(t2, 1);
				
				while ( t1 < t2 )
				{
					tab['"' + wink.math.round(t1, 1) + '"'] = l1;
					t1 += 0.1;
				}
			}
			
			this.lyricsTab = tab;
		},
		
		/**
		 * Loads the LRC file
		 */
		_load: function()
		{
			var xhr = new wink.Xhr();
			xhr.sendData(this._file, null, 'GET', {context: this, method: '_onLoadSuccess'}, {context: this, method: '_onLoadFailure'});
		},
	
		/**
		 * Process the LRC file
		 */
		_onLoadSuccess: function(result)
		{
			if (result.xhrObject.responseText != '') 
			{
				var lyrics = result.xhrObject.responseText.split(/\r\n|\r|\n/);
	
				var l = lyrics.length;
				for ( var i=0; i<l; i++)
				{
					var line = lyrics[i];
	
					if (this.title == null)   this.title = this._checkTitle(line);
					if (this.artist == null)  this.artist = this._checkArtist(line);
					if (this.album == null)   this.album = this._checkAlbum(line);
					if (this.editor == null) this.editor = this._checkEditor(line);
					if (this.version == null) this.version = this._checkVersion(line);
					if (this.creator == null) this.creator = this._checkCreator(line);
					if (this.offset == null)  this.offset = this._checkOffset(line);
					
					var lyric = this._checkLyrics(line);
					
					if ( lyric != null )
					{
						this.lyricsTab.push(lyric);
					}
				}
				this._treatLyrics();
				this._isReady = true;
			}
		},
	
		/**
		 * Load failure callback
		 */
		_onLoadFailure: function(result)
		{
			wink.log('[LRC Reader] Unable to load the lyrics');
		},
		
		/**
		 * Initializes the properties of the component
		 */
		_initProperties: function()
		{
			this._file = this._properties.file;
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( wink.isUndefined(this._properties.file))
			{
				wink.log('[LRC Reader] You must specify an Audio File');
				return false;
			}
		}
	};
	
	return wink.mm.AudioPlayer;
});