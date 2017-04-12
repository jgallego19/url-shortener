var clipboard = new Clipboard('.btn-clipboard');

clipboard.on('success', (e) => {
    e.clearSelection();
    $('.btn-clipboard').tooltip({ title: 'Copied to Clipboard!' }).tooltip('show');
    $('.btn-clipboard').mouseleave(() => {
        $('.btn-clipboard').tooltip('hide');
    });
});

$('.btn-shorten').on('click', () => {
    $.ajax({
        url: '/shorten',
        type: 'POST',
        dataType: 'JSON',
        data: {
            url: $('#url').val()
        },
        success: function(data) {
            var resultHTML = '<a href="' + data.shortUrl + '" id="shorten-link" target="_blank">' +
                data.shortUrl + '</a>' +
                '<button class="btn btn-clipboard" data-clipboard-target="#shorten-link" data-toggle="tooltip">' +
                '<span class="glyphicon glyphicon-modal-window" alt="Copy to clipboard" title="Copy to clipboard"></span>' +
                '</button>';
            $('#link').html(resultHTML);
            $('#link').hide().fadeIn('slow');
        }
    });

});
