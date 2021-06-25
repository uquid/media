(function () {
    $(function () {
        'use strict';
        post = $.extend({}, post, window.csrf);
        var r = new Resumable({
            target: url,
            testChunks: true,
            fileType: ['jpg', 'png', 'jpeg', 'pdf'],
            query: post
        });
        var r2 = new Resumable({
            target: url,
            testChunks: true,
            fileType: ['jpg', 'png', 'jpeg', 'pdf'],
            query: post
        });

        r.assignBrowse(document.getElementById('add-photo-btn'));
        r2.assignBrowse(document.getElementById('add-photo2-btn'));

        var progressBar = new ProgressBar($('#photo-upload-progress'));
        var progressBar2 = new ProgressBar($('#photo2-upload-progress'));

        r.on('fileAdded', function (file, event) {
            if (r.getSize() > maxSize) {
                alert('Maximum size you can upload is 3MB');
                return false;
            }
            progressBar.fileAdded();
            r.upload();
        });
        r2.on('fileAdded', function (file, event) {
            if (r2.getSize() > maxSize) {
                alert('Maximum size you can upload is 3MB');
                return false;
            }
            progressBar2.fileAdded();
            r2.upload();
        });

        r.on('fileSuccess', function (file, message) {
            var url = 'Uploaded';
            $('#photo-link').html(url);
            $('#photo').val(message);
            progressBar.finish();
        });
        r2.on('fileSuccess', function (file, message) {
            var url = 'Uploaded';
            $('#photo2-link').html(url);
            $('#photo2').val(message);
            progressBar2.finish();
        });

        r.on('progress', function () {
            progressBar.uploading(r.progress() * 100);
        });
        r2.on('progress', function () {
            progressBar2.uploading(r2.progress() * 100);
        });

        function ProgressBar(ele) {
            this.thisEle = $(ele);
            this.fileAdded = function () {
                (this.thisEle).removeClass('hide').find('.progress-bar').css('width', '0%');
            },
                this.uploading = function (progress) {
                    (this.thisEle).find('.progress-bar').attr('style', "width:" + progress + '%');
                },
                this.finish = function () {
                    (this.thisEle).addClass('hide').find('.progress-bar').css('width', '0%');
                    $('#submit_upgrade_account_kyc').valid();
                }
        }
    });

    $(document).ready(function () {
        var form = $("#submit_upgrade_account_kyc");

        $(".submit-btn").on('click', function (e) {
            e.preventDefault();
            form.find('.alert').html('').hide();
            if (form.valid()) {
                var formData = new FormData(jQuery('#submit_upgrade_account_kyc')[0]);
                for(var key in window.csrf){
                    formData.append(key, window.csrf[key]);
                }
                UQAJAX.post({
                    url: form.attr('action'),
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    ladda: '#upgradeKYCBTN',
                    reloadUserBalances: true,
                    xhr: function () {  // Custom XMLHttpRequest
                        var myXhr = $.ajaxSettings.xhr();
                        if (myXhr.upload) { // Check if upload property exists
                            myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // For handling the progress of the upload
                        }
                        return myXhr;
                    },
                    success: function (res) {
                        if (res.status) {
                            form.find("#success-alert").html(res.message).show();
                            window.setTimeout(function () {
                                $('.upgradeCardModal0001').modal('hide');
                            }, 1500);
                        } else {
                            form.find("#error-alert").html(res.message).show();
                        }
                    },
                    error: function () {
                        console.warn('server error');
                    }
                });
            }
        });
    });

    function progressHandlingFunction(e) {
        if (e.lengthComputable) {
            //$('.progress').attr({value:e.loaded,max:e.total});
        }
    }

    window.progressHandlingFunction = progressHandlingFunction;

})(jQuery)