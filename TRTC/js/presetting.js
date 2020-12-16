// preset before starting RTC
class Presetting {
  init() {
    // populate userId/roomId
//  $('#userId').val('user_' + parseInt(Math.random() * 100000000));
//  $('#roomId').val(parseInt(Math.random() * 100000));
		// $('#userId').val(sessionStorage.getItem('userId'));
		// $('#roomId').val(sessionStorage.getItem('roomId'));
    // const roomId = this.query('roomId');
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
    const roomId = sessionStorage.getItem('roomNo') || "";

    callback({
      sdkAppId,
      userId,
      userSig,
      roomId
    });
  }
}
