// preset before starting RTC
class Presetting {
  init() {

    const userId = sessionStorage.getItem('userId') || "";
		const roomId = sessionStorage.getItem('roomId') || "";
    if (roomId) {
      $('#roomId').val(roomId);
    }
    if (userId) {
      $('#userId').val(userId);
    }

    $('#main-video-btns').hide();
    $('.mask').hide();
    setBtnClickFuc();
  }

  query(name) {
    const match = window.location.search.match(new RegExp('(\\?|&)' + name + '=([^&]*)(&|$)'));
    return !match ? '' : decodeURIComponent(match[2]);
  }
	
  login(share,appId,secretKey, callback) {
    // let userId = $('#userId').val();
		let userId  = sessionStorage.getItem('userId') || "";
    if (share) {
      userId = 'share_' + userId;
    }
    const config = genTestUserSig(userId,appId,secretKey,);
    const sdkAppId = config.sdkAppId;
    const userSig = config.userSig;
    const roomId = sessionStorage.getItem('roomId') || "";

    callback({
      sdkAppId,
      userId,
      userSig,
      roomId
    });
  }
}
