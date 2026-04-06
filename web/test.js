const Image = document.getElementById('avatarFileInput');
const Avatar = document.getElementById("profileAvatarPreview");

Image.onchange = function(){
    const getimg = Image.files[0];

    if(getimg){
        const url_avatar = URL.createObjectURL(getimg);
        Avatar.src = url_avatar;
        console.log('Done');
    }
}

