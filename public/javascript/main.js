document.getElementById('createRoom').onclick = function(e) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/room');
	xhr.send();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			var parsed = JSON.parse(xhr.responseText);
			if (parsed.success)
				window.location.replace('/room/' + parsed.room);
		}
	}
};