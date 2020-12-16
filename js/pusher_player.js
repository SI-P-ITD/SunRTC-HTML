
//////////////////////////////////////////////////////
//IPusherPluginCtrl
//////////////////////////////////////////////////////
var bScreenCase = false;
function isRtmpUrl(strUrl) {
    var temp = "rtmp";
    return strUrl.indexOf(temp) >= 0;
}

/**
 * 设置非静音
 */
function setMute0() {
    pusher.setMute(0);
}
/**
 * 设置静音
 */
function setMute1(){
	pusher.setMute(1);
}

function doStartPush(targetURL) {
    if (targetURL == "" || isRtmpUrl(targetURL) == false) {
        	alert("音频下行启动失败");
    } else {
        pusher.setPusherEventCallBack(PusherEventListener, 100);
        pusher.startAudioCapture();
//        pusher.startCameraPreview();
        var vRetInt = pusher.startPush(targetURL);
        if(vRetInt == 0){
        	alert("音频下行启动失败"+vRetInt);        	
        }else{
        	document.getElementById("pushUrlFont").style.color="green";
        }
    }
}

function doPushOpenSystemAudioMuxer(ckbox) {
    var ckbox = document.getElementById(ckbox.id);
    if (ckbox.checked){
        pusher.openSystemVoiceInput(1);
    }
    else{
        pusher.openSystemVoiceInput(0);
    }
}

function doPushOpenRecordScreenArea(ckbox) {
    var ckbox = document.getElementById(ckbox.id);
    if (ckbox.checked) {
        bScreenCase = true;
    }
    else{
        bScreenCase = false;
    }
}

function doStopPush() {
    pusher.stopPush();
}

function refreshCamera() {
    var szRet = pusher.enumCameras();
    var obj = JSON.parse(szRet);
    if (obj.camera_cnt != 0) {
        for (var i = 0; i < obj.camera_cnt; ++i) {
            //jsCameraToSelect(obj.cameralist[i].id, obj.cameralist[i].name);
            //alert(obj.cameralist[i].name);
            var objSelect = document.getElementById('cameralistselect');
            objSelect.add(new Option(obj.cameralist[i].camera_name, obj.cameralist[i].id));
        }
        switchCameraSelect();
    }
    else {
        alert("无可用摄像头");
    }
}

function screenShotPusher() {
    //第一个参数指定文件， 第二个参数指定路径，如果不需要指定文件，则""
    var ret = pusher.captureVideoSnapShot("", "D:\\subTest");
    var ret = pusher.captureVideoSnapShot("D:\\subTest\\123.jpg", "D:\\subTest");
    //-1:失败，-2路径非法，-3文件存在，-4未推流
    if (ret == -1) {
        alert("截图失败");
    }
    else if (ret == -2) {
        alert("路径非法");
    }
    else if (ret == -3) {
        alert("文件存在");
    }
    else if (ret == -4) {
        alert("未推流");
    }
}

function getNewPushUrl() {
	if(!pusher){
		alert("pusher不存在");
		return;
	}
    var szRet = pusher.getNewPushUrl();
    var obj = JSON.parse(szRet);
    if (obj.suc == 1) {
        document.getElementById('pushUrl').value = obj.push_url;
        document.getElementById('playerUrl').value = obj.play_url;
    }
    else {
        alert("获取推流地址失败！");
    }
}


function switchCameraSelect() {
    var obj = document.getElementById('cameralistselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var val = obj.options[index].value;
    pusher.switchCamera(parseInt(val));
}

function BitrateModeChange() {
    var obj = document.getElementById('cameralistselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var name = obj.options[index].name;
    if (name == "超清") {
        pusher.setVideoBitRate(800);
    }
    else if (name == "高清") {
        pusher.setVideoBitRate(500);
    }
    else if (name == "标清") {
        pusher.setVideoBitRate(300);
    }
}

function doFpsRateSelect() {
    var obj = document.getElementById('fpsrateselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var value = obj.options[index].value;
    pusher.setVideoFPS(parseInt(value));
}

function ResolutionselectModeSelect() {
    //alert("ResolutionselectModeSelect");
    var obj = document.getElementById('resolutionselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var value = obj.options[index].value;
    pusher.setVideoResolution(parseInt(value));
}

function doRenderTypeSelect() {
    //alert("ResolutionselectModeSelect");
    var obj = document.getElementById('rendertypeselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var value = obj.options[index].value;
    pusher.setRenderMode(parseInt(value));
}

function doRotationSelect() {
    //alert("ResolutionselectModeSelect");
    var obj = document.getElementById('rotationselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var value = obj.options[index].value;
    pusher.setRotation(parseInt(value));
}

function doPusherEventCallBack(eventId, objectId, paramJson) {
    //200001 参考iOnEventCallBackDef.h
    if (eventId == 200001) {
        doUpdatePusherStatusInfo(paramJson);
    }
}


function doUpdatePusherSnapShot(paramJson) {
    var obj = JSON.parse(paramJson);
    if (obj.paramCnt == 2) {
        if (obj.paramlist[0].key == "EVT_PARAM1" && obj.paramlist[1].key == "EVT_PARAM2") {
            if (obj.paramlist[0].value == "0") {
                //截图成功
                //url = obj.paramlist[1].value; utf8编码,windows下需要转成unicode
                alert(obj.paramlist[1].value)
            }
        }
    }
}

function doUpdatePusherStatusInfo(paramJson) {
    var obj = JSON.parse(paramJson);
    if (obj.paramCnt != 0) {
        for (var i = 0; i < obj.paramCnt; ++i) {
//            if(obj.paramlist[i].key == "VIDEO_BITRATE")
//                document.getElementById('PUSHVIDEO_BITRATEID').innerHTML = obj.paramlist[i].value;
//            else if(obj.paramlist[i].key == "AUDIO_BITRATE")
//                document.getElementById('PUSHAUDIO_BITRATEID').innerHTML = obj.paramlist[i].value;
//            else if(obj.paramlist[i].key == "VIDEO_FPS")
//                document.getElementById('PUSHVIDEO_FPSID').innerHTML = obj.paramlist[i].value;
//            else if(obj.paramlist[i].key == "NET_SPEED")
//                document.getElementById('PUSHNET_SPEEDID').innerHTML = obj.paramlist[i].value;
//            else if(obj.paramlist[i].key == "CACHE_SIZE")
//                document.getElementById('PUSHCACHE_SIZEID').innerHTML = obj.paramlist[i].value;
//            else if(obj.paramlist[i].key == "VIDEO_WIDTH")
//                document.getElementById('PUSHVIDEO_WIDTHID').innerHTML = obj.paramlist[i].value;
//            else if(obj.paramlist[i].key == "VIDEO_HEIGHT")
//                document.getElementById('PUSHVIDEO_HEIGHTID').innerHTML = obj.paramlist[i].value;
//            else if(obj.paramlist[i].key == "CODEC_CACHE")
//                document.getElementById('PUSHCODEC_CACHEID').innerHTML = obj.paramlist[i].value;
        }
    }
}

//////////////////////////////////////////////////////
//IPlayerPluginCtrl
//////////////////////////////////////////////////////
//player interface
function doStartPlay(targetURL) {
    //alert(targetURL);
    if (targetURL == "" || isRtmpUrl(targetURL) == false) {
        alert("请输入正确拉流url");
    }
    else {
        player.setTXEPlayType(1);
        player.setRenderWndSize(621, 329);
        player.setPlayerEventCallBack(PlayerEventListener, 200);
        player.startPlay(targetURL, 1);

    }
}
function doStopPlay() {
    player.stopPlay();
}

function screenShotPlayer() {
    var ret = player.captureVideoSnapShot("", "Coo123213214124jsf");
//    var ret = player.captureVideoSnapShot("D:\\subTest\\123.jpg", "D:\\subTest");
    if (ret == -1) {
        alert("截图失败");
    }
    else if (ret == -2) {
        alert("路径非法");
    }
    else if (ret == -3) {
        alert("文件存在");
    }
    else if (ret == -4) {
        alert("未拉流");
    }
}

function doPlayerRenderTypeSelect() {
    //alert("ResolutionselectModeSelect");
    var obj = document.getElementById('player_rendertypeselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var value = obj.options[index].value;
    player.setRenderMode(parseInt(value));
}

function doPlayerRotationSelect() {
    //alert("ResolutionselectModeSelect");
    var obj = document.getElementById('player_rotationselect');
    var index = obj.selectedIndex; //序号，取当前选中选项的序号  
    var value = obj.options[index].value;
    player.setRotation(parseInt(value));
}


function doPlayerEventCallBack(eventId, paramJson) {
    if (eventId == 200002) {
        doUpdatePlayerStatusInfo(paramJson);
    }
}

function doUpdatePlayerSnapShot(paramJson) {
    var obj = JSON.parse(paramJson);
    if (obj.paramCnt == 2) {
        if (obj.paramlist[0].key == "EVT_PARAM1" && obj.paramlist[1].key == "EVT_PARAM2")
        {
            if (obj.paramlist[0].value == "0") {
                //截图成功
                //url = obj.paramlist[1].value; utf8编码,windows下需要转成unicode
                alert(obj.paramlist[1].value)
            }
        }
    }
}

function doUpdatePlayerStatusInfo(paramJson) {
    var obj = JSON.parse(paramJson);
    if (obj.paramCnt != 0) {
        for (var i = 0; i < obj.paramCnt; ++i) {
//            if (obj.paramlist[i].key == "VIDEO_BITRATE")
//                document.getElementById('PLAYVIDEO_BITRATEID').innerHTML = obj.paramlist[i].value;
//            else if (obj.paramlist[i].key == "AUDIO_BITRATE")
//                document.getElementById('PLAYAUDIO_BITRATEID').innerHTML = obj.paramlist[i].value;
//            else if (obj.paramlist[i].key == "VIDEO_FPS")
//                document.getElementById('PLAYVIDEO_FPSID').innerHTML = obj.paramlist[i].value;
//            else if (obj.paramlist[i].key == "NET_SPEED")
//                document.getElementById('PLAYNET_SPEEDID').innerHTML = obj.paramlist[i].value;
//            else if (obj.paramlist[i].key == "CACHE_SIZE")
//                document.getElementById('PLAYCACHE_SIZEID').innerHTML = obj.paramlist[i].value;
//            else if (obj.paramlist[i].key == "VIDEO_WIDTH")
//                document.getElementById('PLAYVIDEO_WIDTHID').innerHTML = obj.paramlist[i].value;
//            else if (obj.paramlist[i].key == "VIDEO_HEIGHT")
//                document.getElementById('PLAYVIDEO_HEIGHTID').innerHTML = obj.paramlist[i].value;
//            else if (obj.paramlist[i].key == "CODEC_CACHE")
//                document.getElementById('PLAYCODEC_CACHEID').innerHTML = obj.paramlist[i].value;
        }
    }
}

var PusherEventListener = function (msg) {
    var obj = JSON.parse(msg);
    if(parseInt(obj.eventId) == 1002) {
    	log("语音下行接入");
    } else if (parseInt(obj.eventId) == 200001) {
        doUpdatePusherStatusInfo(msg);
    } else if (parseInt(obj.eventId) == 1012) {
        doUpdatePusherSnapShot(msg);
    } else if (parseInt(obj.eventId) == 1102) {
    	log("网络状态不佳，语音断开");
    } else if (parseInt(obj.eventId) == 3005) {
    	log("主动断开连接");
    } else if (parseInt(obj.eventId) == -1302) {
    	log("麦克风打开失败");
    } else if (parseInt(obj.eventId) == -1306) {
    	log("不支持音下行发送");
    } else if (parseInt(obj.eventId) == -1307) {
    	log("网络断开");
    } 
};

var PlayerEventListener = function (msg) {
    var obj = JSON.parse(msg);
    if (parseInt(obj.eventId) == 2002 && parseInt(obj.objectId) == 1) {
        log("用户接入成功");
    }else if (parseInt(obj.eventId) == 200002 && parseInt(obj.objectId) == 200) {
        doUpdatePlayerStatusInfo(msg);
    }else if (parseInt(obj.eventId) == 2010) {
        doUpdatePlayerSnapShot(msg);
    }else if(parseInt(obj.eventId) == 2004 ){
    	log("视频开始");
    }else if(parseInt(obj.eventId) == 2006 ){
    	log("视频结束");
    }else if(parseInt(obj.eventId) == 2103 ){
    	log("网络状态不佳");
    }
};

function doCheckIE() {
    var bIE = false;
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        bIE = true;
    else if (window.navigator.userAgent.indexOf("MSIE") >= 1)
        bIE = true;
    else
        bIE = false;
    if (bIE == false)
    {
        document.getElementById('CheckIEStatus').style.display = 'block';
    }
    
};

function doPushRenderYMirror(ckbox) {
    var ckbox = document.getElementById(ckbox.id);
    if (ckbox.checked){
        pusher.setRenderYMirror(true);
    }
    else{
        pusher.setRenderYMirror(false);
    }
};

function doPushOutputYMirror(ckbox) {
    var ckbox = document.getElementById(ckbox.id);
    if (ckbox.checked) {
        pusher.setOutputYMirror(true);
    }
    else {
        pusher.setOutputYMirror(false);
    }
};

function doPlayRenderYMirror(ckbox) {
    var ckbox = document.getElementById(ckbox.id);
    if (ckbox.checked) {
        player.setRenderYMirror(true);
    }
    else {
        player.setRenderYMirror(false);
    }
};
