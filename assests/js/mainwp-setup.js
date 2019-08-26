jQuery( document ).ready( function () {
    jQuery( 'input[type=radio][name=mwp_setup_installation_hosting_type]' ).change( function () {
        if (this.value == 2) {
            jQuery('input[name="mwp_setup_installation_system_type"]').removeAttr("disabled");
        }
        else {
            jQuery('input[name="mwp_setup_installation_system_type"]').attr("disabled", "disabled");
        }
        mainwp_setup_showhide_os_settings(this.value == 2 ? true : false);
    } );

    jQuery( 'input[type=radio][name=mwp_setup_installation_system_type]' ).change( function () {
        mainwp_setup_showhide_ssl_settings( true );
    } );

    jQuery( '#mwp_setup_planning_backup' ).change( function () {
        if ( jQuery( this ).is( ':checked' ) ) {
            jQuery( '#mwp_setup_tr_backup_method' ).fadeIn( 500 );
            jQuery( '#mwp_setup_backup_method' ).removeAttr( 'disabled' );
        } else {
            jQuery( '#mwp_setup_tr_backup_method' ).fadeOut( 500 );
            jQuery( '#mwp_setup_backup_method' ).attr( 'disabled', 'disabled' );
        }
    } );

    jQuery( '#mwp_setup_backup_method' ).on( 'change', function () {
        var bkmethod = jQuery( this ).val();
        jQuery( '#mainwp-quick-setup-account-login').toggle( (bkmethod != '' ? true : false) );
    } );

    jQuery( '#mwp_setup_manage_planning' ).change( function () {
        if ( ( jQuery( this ).val() == 2 ) && ( jQuery( '#mwp_setup_type_hosting' ).val() == 3 ) ) {
            jQuery( '#mwp_setup_hosting_notice' ).fadeIn( 500 );
        } else {
            jQuery( '#mwp_setup_hosting_notice' ).fadeOut( 1000 );
        }
    } )

    jQuery( '#mwp_setup_manage_planning' ).change( function () {
        mainwp_setup_showhide_hosting_notice();
    } )
    jQuery( '#mwp_setup_type_hosting' ).change( function () {
        mainwp_setup_showhide_hosting_notice();
    } )
} );


mainwp_setup_showhide_os_settings = function( pShow ) {
    var row = jQuery('#mainwp-quick-setup-system-type');
    if ( pShow ) {
        row.fadeIn( 500 );
    } else {
        row.fadeOut( 500 );
    }
    mainwp_setup_showhide_ssl_settings( pShow );
}

mainwp_setup_showhide_ssl_settings = function( pShow ) {
    var show = false;
    if ( pShow ) {
        if (jQuery('input[name="mwp_setup_installation_system_type"]:checked').val() == 3) {
            show = true;
        }
    }

    var row = jQuery('#mainwp-quick-setup-opessl-location');
    if (show) {
        row.fadeIn( 500 );
    } else {
        row.fadeOut( 500 );
    }
}


mainwp_setup_auth_uptime_robot = function ( url ) {
    window.open( url, 'Authorize Uptime Robot', 'height=600,width=1000' );
    return false;
}


mainwp_setup_showhide_hosting_notice = function () {
    if ( ( jQuery( '#mwp_setup_manage_planning' ).val() == 2 ) && ( jQuery( '#mwp_setup_type_hosting' ).val() == 3 ) ) {
        jQuery( '#mwp_setup_hosting_notice' ).fadeIn( 500 );
    } else {
        jQuery( '#mwp_setup_hosting_notice' ).fadeOut( 500 );
    }
}

mainwp_setup_grab_extension = function ( retring ) {
    var parent = jQuery( "#mwp_setup_auto_install_loading" );
    var statusEl = parent.find( 'span.status' );
    var loadingEl = parent.find( ".ui.dimmer" );

    var extProductId = jQuery( '#mwp_setup_extension_product_id' ).val();
    if ( extProductId == '' ) {
        statusEl.css( 'color', 'red' );
        statusEl.html( ' ' + "ERROR: empty extension product id." ).fadeIn();
        return false;
    }

    var data = {
        action: 'mainwp_setup_extension_getextension',
        productId: extProductId
    };

    if ( retring == true ) {
        statusEl.css( 'color', '#0074a2' );
        statusEl.html( ' ' + "Connection error detected. The Verify Certificate option has been switched to NO. Retrying..." ).fadeIn();
    } else
        statusEl.hide();

    loadingEl.show();
    jQuery.post( ajaxurl, data, function ( response )
    {
        loadingEl.hide();
        var undefError = false;
        if ( response ) {
            if ( response.result == 'SUCCESS' ) {
                jQuery( '#mainwp-quick-setup-extension-activation' ).html( response.data );
                mainwp_setup_extension_install( );
            } else if ( response.error ) {
                statusEl.css( 'color', 'red' );
                statusEl.html( response.error ).fadeIn();
            } else if ( response.retry_action && response.retry_action == 1 ) {
                mainwp_setup_grab_extension( true );
                return false;
            } else {
                undefError = true;
            }
        } else {
            undefError = true;
        }

        if ( undefError ) {
            statusEl.css( 'color', 'red' );
            statusEl.html( '<i class="exclamation circle icon"></i> Undefined error!' ).fadeIn();
        }
    }, 'json' );
    return false;
}

mainwp_setup_extension_install = function () {
    var pExtToInstall = jQuery( '#mainwp-quick-setup-installation-progress .extension_to_install' );
    var loadingEl = pExtToInstall.find( '.ext_installing .install-running' );
    var statusEl = pExtToInstall.find( '.ext_installing .status' );
    loadingEl.show();
    statusEl.css( 'color', '#000' );
    statusEl.html( '' );

    var data = {
        action: 'mainwp_setup_extension_downloadandinstall',
        download_link: pExtToInstall.attr( 'download-link' ),
        security: mainwpSetupLocalize.nonce
    };

    jQuery.ajax( {
        type: 'POST',
        url: ajaxurl,
        data: data,
        success: function () {
            return function ( res_data ) {
                loadingEl.hide();
                var reg = new RegExp( '<mainwp>(.*)</mainwp>' );
                var matches = reg.exec( res_data );
                var response = '';
                var failed = true;
                if ( matches ) {
                    response_json = matches[1];
                    response = jQuery.parseJSON( response_json );
                }
                if ( response != '' ) {
                    if ( response.result == 'SUCCESS' ) {
                        failed = false;
                        statusEl.css( 'color', '#21759B' )
                        statusEl.html( response.output ).show();
                        jQuery( '#mainwp-quick-setup-installation-progress' ).append( '<span class="extension_installed_success" slug="' + response.slug + '"></span>' );

                        jQuery( '#mwp_setup_active_extension' ).fadeIn( 500 );
                        mainwp_setup_extension_activate( false );

                    } else if ( response.error ) {
                        statusEl.css( 'color', 'red' );
                        statusEl.html( '<strong><i class="exclamation circle icon"></i> ERROR:</strong> ' + response.error ).show();
                    } else {
                        statusEl.css( 'color', 'red' );
                        statusEl.html( '<i class="exclamation circle icon"></i> Undefined error!' ).show();
                    }
                } else {
                    statusEl.css( 'color', 'red' );
                    statusEl.html( '<i class="exclamation circle icon"></i> Undefined error!' ).show();
                }
                if ( failed ) {
                    jQuery( '#mainwp-quick-setup-extension-activation' ).append( jQuery( '#mwp_setup_extension_retry_install' )[0].innerHTML );
                }
            }
        }()
    } );
    return false;
}


mainwp_setup_extension_activate_plugin = function () {
    var plugins = [ ];
    jQuery( '.extension_installed_success' ).each( function () {
        plugins.push( jQuery( this ).attr( 'slug' ) );
    } );

    if ( plugins.length == 0 ) {
        return;
    }

    var data = {
        action: 'mainwp_setup_extension_activate_plugin',
        plugins: plugins,
        security: mainwpSetupLocalize.nonce
    };

    jQuery.post( ajaxurl, data, function ( response ) {
        if ( response == 'SUCCESS' ) {
            jQuery( '#mwp_setup_active_extension' ).fadeIn( 500 );
            mainwp_setup_extension_activate( false );
        } else {

        }
    } );
}

mainwp_setup_extension_activate = function ( retring )
{
    var parent = jQuery( "#mwp_setup_grabing_api_key_loading" );
    var statusEl = parent.find( 'span.status' );
    var loadingEl = parent.find( "i" );
    var extensionSlug = jQuery( '#mwp_setup_extension_product_id' ).attr( 'slug' );
    var data = {
        action: 'mainwp_setup_extension_grabapikey',
        slug: extensionSlug
    };

    if ( retring == true ) {
        statusEl.css( 'color', '#0074a2' );
        statusEl.html( ' ' + "Connection error detected. The Verify Certificate option has been switched to NO. Retrying..." ).fadeIn();
    } else
        statusEl.hide();

    loadingEl.show();
    jQuery.post( ajaxurl, data, function ( response )
    {
        loadingEl.hide();
        if ( response ) {
            if ( response.result == 'SUCCESS' ) {
                statusEl.css( 'color', '#0074a2' );
                statusEl.html( '<i class="check circle icon"></i> ' + "Extension has been activated successfully!" ).fadeIn();
            } else if ( response.error ) {
                statusEl.css( 'color', 'red' );
                statusEl.html( response.error ).fadeIn();
            } else if ( response.retry_action && response.retry_action == 1 ) {
                jQuery( "#mainwp_api_sslVerifyCertificate" ).val( 0 );
                mainwp_setup_extension_activate( true );
                return false;
            } else {
                statusEl.css( 'color', 'red' );
                statusEl.html( '<i class="exclamation circle icon"></i> Undefined error!' ).fadeIn();
            }
        } else {
            statusEl.css( 'color', 'red' );
            statusEl.html( '<i class="exclamation circle icon"></i> Undefined error!' ).fadeIn();
        }
    }, 'json' );
};

jQuery( document ).ready( function () {

  jQuery( document ).on( 'click', '#mainwp-multi-emails-add', function () {
      jQuery( '#mainwp-multi-emails-add' ).before( '<div id="mainwp-multi-emails"><input type="text" name="mainwp_options_email[]" value=""/><a href="#" id="mainwp-multi-emails-remove" class="ui button basic red">Remove Email</a></div>' );
      return false;
  } );

  jQuery( document ).on( 'click', '#mainwp-multi-emails-remove', function () {
      jQuery( this ).closest( '#mainwp-multi-emails' ).remove();
      return false;
  } );

} );

