'use strict';
function AudioWaveform(divId, src) {  //构造函数
    //functions to manipulate wave format
    var me = this;
    
    var floatTo16BitPCM = function(output, offset, input) {
        for (var i = 0; i < input.length; i++, offset += 2) {
            var s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    };
    var writeString = function(view, offset, string) {
        for (var i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    this.encodeWAV = function(samples, sampleRate) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        var view = new DataView(buffer);

        /* RIFF identifier */
        writeString(view, 0, 'RIFF');
        /* file length */
        view.setUint32(4, 32 + samples.length * 2, true);
        /* RIFF type */
        writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, 1, true);
        /* sample rate */
        view.setUint32(24, sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, sampleRate * 2, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, 2, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, samples.length * 2, true);

        floatTo16BitPCM(view, 44, samples);

        return view;
    };
    this.createWavBlob = function() {
        var buf = this.wavesurfer.backend.buffer;
        var data = buf.getChannelData(0);
        var wav = this.encodeWAV(data, buf.sampleRate);
        var blob = new Blob([wav], {type: 'audio/wav'});
        return blob;
    };
    //create wavesurfer
    this.wavesurfer = Object.create(WaveSurfer);
    /*
     *  可由options 调整样式
     *  参见官方文档https://wavesurfer-js.org/docs/options.html
     * */
    var options = {
        container: document.querySelector(divId),
        waveColor: '#333333',   //波形颜色
        progressColor: '#CCCCCC', //已播放颜色
        cursorColor: '#fff' //指针颜色
    };
    this.wavesurfer.init(options); //初始化
    this.wavesurfer.load(src); //加载语音路径
    this.onReady = function () {
        me.timeline = Object.create(WaveSurfer.Timeline); //时间轴
        me.timeline.init({
            wavesurfer: me.wavesurfer,
            container: "#wave-timeline"
        });
    };
    this.onError = function (err) {
        console.log(err);
        var sound_url='/play_sounds/wav_request?_id='+_id+'&time='+sounds_time;
        $.ajax({
            type:'GET',
            url: sound_url,
            dataType: "json",
            async:true,
            success: sounds,
            error:function() {
                $('#_voice').html('<p style="width:100%;text-align:center;">暂无语音</p>').show();
                $('.lod').slideUp(600);
            }
        }); 
    };
    this.onFinish = function (err) {
        console.log('Finished');
    };
    this.wavesurfer.on('ready', this.onReady);
    this.wavesurfer.on('error', this.onError);
    this.wavesurfer.on('finish', this.onFinish);

    if (this.wavesurfer.enableDragSelection) {
        this.wavesurfer.enableDragSelection({ //被选区域颜色
            color: 'rgba(0, 255, 0, 0.1)'
        	 //color: 'rgba(255,153,51,0.2)'
        });
    }
    this.wavesurfer.initEditor();

    ///////////////////////////////////////////////////////////////
    this.onZoom = function () {
        var val = Number(this.value);
        me.wavesurfer.zoom(val);
	console.log('onZoom val:' + val);
    };
    this.onZoomFit = function() {
	var fit = 256;
        me.wavesurfer.zoom(fit);
        me.slider.value = fit;
	console.log('inside onZoomFit fit is ' + fit);
    };

    this.onFileSelect = function (evt) {
        var files = evt.target.files;
        var output = [];
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            me.wavesurfer.loadBlob(f);
        }
    };
    this.onUpload = function() {
        console.log('inside upload');
        var buf = me.wavesurfer.backend.buffer;
        var data = buf.getChannelData(0);
        var wav = me.encodeWAV(data, buf.sampleRate);

        var xhr = new XMLHttpRequest();
        xhr.open('post', '/upload_audio.php', true);
        var bar = document.querySelector('progress');
        xhr.upload.onprogress = function (e) {
            bar.value = (e.loaded / e.total) * 100;
            bar.textContent = bar.value;
        };
        console.log('begin send');
        var blob = new Blob([wav], {type: 'audio/wav'});
        xhr.send(blob);
    };
    this.onDownload = function() {
        console.log('inside download');
        var bar = document.querySelector('progress');
        var xhr = new XMLHttpRequest();
        xhr.open('get', '/upload.wav', true);
        xhr.responseType = 'blob';
        xhr.onprogress = function (e) {
            bar.value = (e.loaded / e.total) * 100;
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                me.wavesurfer.loadBlob(xhr.response);
            }
        }
        xhr.send(null);
    };
    this.onCut = function() {
        me.wavesurfer.editor.cut();
    };
    this.onCopy = function() {
    	me.wavesurfer.editor.copy();
    };
    this.onPlayPattern = function() {  //播放选取片段
    	me.wavesurfer.editor.playPattern();
    };
    this.getStartAndEnd=function(){ //获取选中片段的开始时间和结束时间
		this.timeArr=me.wavesurfer.editor.getStartAndEndTime();
    };
    this.onPaste = function() {
        me.wavesurfer.editor.paste();
    };
    this.onClear = function() {
        me.wavesurfer.clearRegions();
    };
    this.onUndo = function() {
        me.wavesurfer.editor.undo();
    };
    /*
     *  音频的播放/暂停
     * */
    this.onPlay = function(evt) {
        IamReady=1;
		var bnt = evt.target; //事件源
		if (bnt.textContent == '播放') {
			me.wavesurfer.play();
			bnt.textContent = '暂停';
		} else {
	        	me.wavesurfer.pause();
			bnt.textContent = '播放';
		}
    	
    	/*var region=me.wavesurfer.editor.getRegion();
    	if(region!=null){
    		me.wavesurfer.editor.playPattern();
    		return;
    	}
    	me.wavesurfer.play();*/
    };
    this.onStop = function() {
        me.wavesurfer.stop();
	    me.wavesurfer.seekTo(0);
    };
	this.onPause = function() {
		me.wavesurfer.pause();
	};
    this.onSave = function (e) {
        var blob = me.createWavBlob();
        var a = document.getElementById('saveanchor');
        a.href = URL.createObjectURL(blob);
        console.log('inside onSave');
    };
	this.onSeek = function() {
		var progress = this.value/100.0;
		
		console.log('seek to ' + progress);
		me.wavesurfer.seekAndCenter(progress);
	};
    var hookEvent = function (id, evt, callback) {
        if (typeof(id) == 'string')
            document.getElementById(id).addEventListener(evt, callback, false);
        else
            id.addEventListener(evt, callback, false);
    };
    var get = function (id) {
        return document.getElementById(id);
    };
    this.slider = get('zoom');
    /*this.wavefile = get('wavefile');
    this.cutBnt = get('cutbutton');
    this.saveBnt = get('savebutton');
    this.uploadBnt = get('uploadbutton');
    this.downloadBnt = get('downloadbutton');
    this.clearBnt = get('clearbutton');
    this.pasteBnt = get('pastebutton');
    this.copyBnt = get('copybutton');
    this.undoBnt = get('undobutton');*/
    this.playBnt = get('playbutton');
    this.stopBnt = get('stopbutton');
   /* this.zoomFitBnt = get('zoomfitbutton');*/

    hookEvent(this.slider, 'change', this.onZoom);
    /*hookEvent(this.wavefile, 'change', this.onFileSelect);
    hookEvent(this.cutBnt, 'click', this.onCut);
    hookEvent(this.saveBnt, 'click', this.onSave);
    hookEvent(this.uploadBnt, 'click', this.onUpload);
    hookEvent(this.downloadBnt, 'click', this.onDownload);
    hookEvent(this.clearBnt, 'click', this.onClear);
    hookEvent(this.pasteBnt, 'click', this.onPaste);
    hookEvent(this.copyBnt, 'click', this.onCopy);
    hookEvent('undobutton', 'click', this.onUndo);*/
    hookEvent('playbutton', 'click', this.onPlay);
    hookEvent('stopbutton', 'click', this.onStop);
    hookEvent('playPattern', 'click', this.onPlayPattern);//
   /* hookEvent('zoomfitbutton', 'click', this.onZoomFit);
    hookEvent('seek', 'change', this.onSeek);*/
}







