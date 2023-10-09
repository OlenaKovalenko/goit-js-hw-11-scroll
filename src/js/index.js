import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

import { refs } from './refs';
import { fetchBySearch, perPage } from './api';
import { createMarkup } from './createMarkup';

refs.searchForm.addEventListener('submit', onFormSubmit);


const simplelightbox = new SimpleLightbox('.gallery a');

let page = 1;
let searchQuery = '';

let options = {
  root: null,
  rootMargin: "0px",
  threshold: 1.0,
};

let observer = new IntersectionObserver(handleObserver, options);

async function onFormSubmit(event) {
    event.preventDefault();
    refs.galleryContainer.innerHTML = '';

    try {
    const formElement = event.currentTarget.elements;
    searchQuery = formElement.searchQuery.value.trim(); 

    if (!searchQuery.length) {
        Notify.warning('Please fill out the search field!');
        return;
        }

    page = 1;
    const { hits, totalHits } = await fetchBySearch(searchQuery, page);

    if (hits === 0) {
        refs.galleryContainer.innerHTML = '';
        Notify.failure("Sorry, there are no images matching your search query. Please try again.", error);
        return;
    }

    createMarkup(hits);
    Notify.success(`Hooray! We found ${totalHits} images`);
    refs.btnScrollUp.classList.remove('visually-hidden');
        
    observer.observe(refs.target);
    simplelightbox .refresh();

    if (totalHits <= perPage) {
    
        Notify.info("We're sorry, but you've reached the end of search results.");
    } else {
        refs.loadMore.style.display = 'block';
    }

    } catch (error) {
        Notify.failure("Sorry, there are no images matching your search query. Please try again.", error);
    
    } finally {
        refs.searchForm.reset();
}
}


async function onLoadMore() {
    page += 1;

    try {
        const { hits, totalHits } = await fetchBySearch(searchQuery, page);
        createMarkup(hits);
        simplelightbox.refresh();

    const totalPage = Math.ceil(totalHits / perPage);
            console.log(totalPage);
            if (page === totalPage) {
                observer.unobserve(refs.target);
            }    

    }
    catch (error) {
        Notify.failure('Oops! Something went wrong. Please try again later.', error);
    }
}


function handleObserver(entries, observer) {
        entries.forEach(entry => {
        if (entry.isIntersecting) {
            onLoadMore();
        }
    })
}


refs.btnScrollUp.addEventListener('click', () => {
    window.scroll(0, 0);
} );