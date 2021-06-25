String.prototype.replaceArray = function(find, replace) {
    var replaceString = this;
    var regex;
    for (var i = 0; i < find.length; i++) {
        regex = new RegExp(find[i], "g");
        replaceString = replaceString.replace(regex, replace[i]);
    }
    return replaceString;
};

$(document).ready(function(e){
    $('.dropdown-menu .lang').removeClass('active');
    $('.lang-'+currentLang).addClass('active');
    //var replaceArr = ['lang=en','lang=ru', 'lang=vi', 'lang=it', 'lang=fr', 'lang=cn', 'lang=ar', 'lang=jp'];
    //var withArr = ['','','','','','','',''];
    //var currentHref = document.location.href,currentHrefNew='';
    //currentHrefNew = currentHref.replaceArray(replaceArr, withArr);
    //if(currentHref != currentHrefNew){
    //    document.location.href = currentHrefNew;
    //}
    // variables
    var $menu = $('#menu');
    var $btnMenu = $('.btn-menu');
    var html = $('.navmenu.navmenu-default .nav.navbar-nav').html();
    //var html = $('.navmenu.navmenu-default').html();
    var $htmlStr = html.replace('dropdown-menu','');
    var $menuItem = "<ul>"+$htmlStr+"</ul>";
    $menu.html($menuItem);
    $menu.mmenu({
        counters: false,
        navbar: {
            title: ""
        },
        extensions: ["pageshadow", "effect-zoom-menu", "effect-zoom-panels"],
        offCanvas: {
            position  : "left",
            zposition : "back"
        }
    });
    var api = $menu.data("mmenu");
    $btnMenu.click(function() {
        api.open();
    });
    api.bind('opening', function() {
        /*$btnMenu.addClass('fixedClose');
         $btnMenu.find('.fa').removeClass('fa-bars').addClass('fa-times');*/
    });
    api.bind('closing', function() {
        /*$btnMenu.removeClass('fixedClose');
         $btnMenu.find('.fa').addClass('fa-bars').removeClass('fa-times');*/
    });
    $menu.find( ".mm-next" ).addClass("mm-fullsubopen");
    $('.navbar.main-menu').scrollToFixed();
});
