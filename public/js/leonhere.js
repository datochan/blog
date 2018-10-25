$(function(){
	$(window).scroll(function(){
		var $top = $(window).scrollTop();
		if($top > 0){
			$('.header').addClass('fixed');
			$('.site-header').addClass('fixed');
		}else{
			$('.header').removeClass('fixed');
			$('.site-header').removeClass('fixed');	
		}
		var $sideH = $('.sidebar').height() + $('.sidebar').offset().top;
		var $scrollT = $top + $('#scroll').height();
		var $footT = $('.footer').offset().top;
		if($top > $sideH){
			if($scrollT > $footT){
				$('#scroll').addClass('stop').removeClass('scroll');
			}else{
				$('#scroll').addClass('scroll').removeClass('stop');
			}
		}else{
			$('#scroll').removeClass('scroll').removeClass('stop');
		}	
	});
	$('.widget ul.hot-post li:last-child,#divComments ul li:last-child').css({'paddingBottom':'0','borderBottomWidth':'0'});
	$('.post .search-result p a:first-child').css('fontWeight','bold');
	$('.loop-entry').hover(function(){
		$(this).addClass('hover');
	},function(){
		$(this).removeClass('hover');
	});
	$('.top-box').after('<nav class="mobile-nav"></nav>');
	$('.header .logo').after('<div class="btn"><i class="icon-th-large"></i></div>');
	$('.nav ul li').hover(function(){
		$(this).children('ul').show();
	},function(){
		$(this).find('ul').hide();
	});
	$('.nav .menu li ul').prepend('<span class="arrow-top"></span>');
	$('.nav .menu li ul').before(' <i class="icon-angle-down"></i>');
	$('.nav .menu').clone(false).appendTo('.mobile-nav');	
	$('.header .btn').click(function(){
		$('.mobile-nav').slideToggle('fast');		
	});
	$(window).resize(function(){	
		var $body = $('body').width();
		if($body > 900){
			$('.mobile-nav').slideUp('fast');			
		}
	});
	$('.commentlist ol li ol:odd()').css('backgroundColor','#fff');
	$('.backtop a').click(function(){
		$('html,body').animate({scrollTop:0},500);
	});
	$('.post .entry img').attr('height','auto');
	$('.post .entry img').css('height','auto');
});