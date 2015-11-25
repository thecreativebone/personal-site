    (function($) { "use strict";
    $(document).ready(function(){

        $('#owl-blog').owlCarousel({
            loop:true,
            margin:30,
            nav:true,
            dots:false,
            responsive:{
                0:{
                    items:1
                },
                600:{
                    items:1
                },
                1000:{
                    items:2
                }
            }
        })

        $('#testimonial').owlCarousel({
            loop:true,
            margin:0,
            nav:true,
            dots:false,
            responsive:{
                0:{
                    items:1
                },
                600:{
                    items:1
                },
                1000:{
                    items:1
                }
            }
        })

    });
    })(jQuery);