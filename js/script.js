accountId = '';
page = '';
account_configuration = {};
do_refresh = false;
frequence_refresh = 5;

function update_page() {
    page = location.hash.replace(/#([^;]+).*/,'$1');
}

function refresh_reporting() {
    if(do_refresh) {
        $('.refresh_button')[0].click();
        console.log('Refresh');
        setTimeout(function() { refresh_reporting(); } , frequence_refresh*1000);
    }
}

function start_refresh() {
    do_refresh = true;
    refresh_reporting();
}

function stop_refresh() {
    do_refresh = false;
}

function open_modale() {
    $('#menu_name').val('');
    $('#modal_div').show();
    $('#menu_name').focus();
}

function open_modale_execute() {
    $('#modal_exec_div').show();
}

function set_type_modale(type) {
    $('#modal_div').attr('nz-type', type);
}

function get_type_modale() {
    return $('#modal_div').attr('nz-type');
}

function close_modale() {
    $('#modal_div').hide();
}

function new_elem_menu(k, name, link) {
    $('#masthead .navigation_links > ul').append($('<li id="link_'+k+'"><a contextmenu="mymenu" class="gwt-Anchor" href="'+link+'">'+name+'<span class="delete_favorite" style="display:none;margin-right:5px;">x</span></a></li>'));
}

function clear_menu() {
    account_configuration.links = [];
    localStorage.setItem(accountId, JSON.stringify(account_configuration));
    $('li[id^=link_]').remove();
}

function generate_all_menu() {
    if(account_configuration.links !== undefined && (typeof account_configuration.links) === 'object') {
        for(var k in account_configuration.links) {
            var link = account_configuration.links[k];
            new_elem_menu(k, link.name, link.link);
        }
    }
}

function add_to_menu() {
    if(account_configuration.links === undefined || (typeof account_configuration.links) !== 'object') {
        account_configuration.links = [];
    }
    var name = $('#menu_name').val();
    account_configuration.links.push({
        link: location.hash,
        name: name
    });
    localStorage.setItem(accountId, JSON.stringify(account_configuration));
    console.log(account_configuration);
    
    new_elem_menu(account_configuration.links.length, name, location.hash);
    //$('#gwt-uid-24').append($('<li id="link_'+name+'"><a contextmenu="mymenu" class="gwt-Anchor" href="'+location.hash+'">'+name+'</a></li>'));
}

function generate_modale() {
    $('body').append('<div id="modal_div" style="display:none;"></div>');
    $('#modal_div').append('<div id="fond_modal" style="position: absolute;width: 100%;height: 100%;background-color: grey;opacity: 0.4;"></div>');
    $('#modal_div').append('<div id="modal" style="position: absolute;width: 50%;top: 150px;margin-left: 25%;"></div>');
    $('#modal').append('<input id="menu_name" type="text" name="menu_name" style="width: 100%" />');
    $('#fond_modal').click(function() {
        close_modale();
    });
    
    $('#menu_name').keypress(function(e) {
        if($('#menu_name').val() !== '') {
            if(e.keyCode == 13) {
                close_modale();
                if( get_type_modale() === 'add_menu') {
                  add_to_menu();
                }
                else if( get_type_modale() === 'import_export_menu') {
                  clear_menu();
                  account_configuration = JSON.parse($('#menu_name').val());
                  localStorage.setItem(accountId, JSON.stringify(account_configuration));
                  generate_all_menu();
                }
            }
        }
        if(e.keyCode == 27) {
            close_modale();
        }
    });
}

function add_menu() {
    generate_all_menu();
    $('#masthead .navigation_links > ul').append($('<li id="import_export_menu" style="float:right;" alt="hidden"><a class="gwt-Anchor" href="#">Import/Export</a></li>'));
    $('#masthead .navigation_links > ul').append($('<li id="delete_from_menu" style="float:right;" alt="hidden"><a class="gwt-Anchor" href="#">Clear</a></li>'));
    $('#masthead .navigation_links > ul').append($('<li id="add_to_menu" style="float:right;"><a class="gwt-Anchor" href="#">+ Add to Menu</a></li>'));
    $('#masthead .navigation_links > ul').append($('<li id="refresh_reporting" style="float:right;"><a class="gwt-Anchor" href="#" alt="off">Start Refresh</a></li>'));
    $('#add_to_menu').click(function(event) {
        event.preventDefault();
        set_type_modale('add_menu');
        open_modale();
    });
    
    $('#delete_from_menu').click(function(event) {
        event.preventDefault();
        clear_menu();
        return;
        
        var e = $(this).find('a');
        if(e.attr('alt') == 'hidden') {
            $('.delete_favorite').show();
            e.text("Close Delete");
            e.attr('alt','tohide');
        }
        else {
            $('.delete_favorite').hide();
            e.text("Delete Items");
            e.attr('alt','hidden');
        }
    });
    $('#refresh_reporting').click(function(event) {
        event.preventDefault();
        
        var e = $(this).find('a');
        if(e.attr('alt') == 'off') {
            start_refresh();
            e.text("Stop Refresh");
            e.attr('alt','on');
        }
        else {
            stop_refresh();
            e.text("Start Refresh");
            e.attr('alt','off');
        }
    });
    
    $('#import_export_menu').click(function(event) {
        event.preventDefault();
        set_type_modale('import_export_menu');
        open_modale();
        $('#menu_name').val(localStorage.getItem(accountId));
    });

}

function generate_actions() {
    $(window).keypress(function(event) {
        if (!(event.which == 115 && event.ctrlKey) && !(event.which == 19)) {
            return true;
        }
        event.preventDefault();
        update_page();
        if(page == 'build' && $('.gwt-TabLayoutPanelContentContainer > div:visible button[data-locator=button-save]').count() > 0) {
            $('.gwt-TabLayoutPanelContentContainer > div:visible button[data-locator=button-save]')[0].click()
        }
    });
}

var count_ready= 0;
function is_ready() {
    count_ready++;
    if(count_ready> 60) {
       console.log('To long');
    }
    else if($('#masthead .navigation_links').length === 0) {
        console.log('not yet');
        setTimeout(function() { is_ready(); } , 1000);
    }
    else {
        console.log('Goo!!!');
        update_page();
        accountId = location.hash.replace(/.*accountId=([^;]+).*/,'$1');
        account_configuration = JSON.parse(localStorage.getItem(accountId));
        if(account_configuration === null) {
            account_configuration = {};
        }
        add_menu();
        generate_modale();
        generate_actions();
    }
}

function force_ready() {
    count_ready = 0;
    is_ready();
}

$(document).ready(function() {
    setTimeout(function() { is_ready(); } , 1000);
});