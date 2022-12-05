import axios from 'axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';

const searchForm = document.querySelector('.search-form');
const search = document.querySelector('[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more')
let page = 1;
const per_page = 20;
let allImg = 0;
let searchValue;
searchForm.addEventListener('submit', onSearch);
loadBtn.addEventListener('click', onLoadMore)


function onSearch(evt) {
    evt.preventDefault();
    clearMarkup();
    searchValue = search.value;
    console.dir(searchValue);
    console.log(pixabayApi(searchValue))
}


async function pixabayApi(searchValue) {
    const BASE_URL = 'https://pixabay.com/api/';
    const apiKey = '31841001-51f92be338cf42306cf8849f6';
    const queryParams = 'image_type=photo&orientation=horizontal&safesearch=true'
    
    
    const response = await axios.get(`${BASE_URL}?key=${apiKey}&q=${searchValue}&${queryParams}&page=${page}`)
        .then(function (response) {
            const arrAllAnswer = response.data.hits;
           
            if (!arrAllAnswer.length) {
                Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
                return;
            }
            allImg = response.data.total;
            console.log(arrAllAnswer);
            console.log(allImg);

            createMarkup (arrAllAnswer)
        })
        .catch(function (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log('Error', error.message);
    }
    console.log(error.config);
        });
    
}

function createMarkup(arrAllAnswer) {
    Notiflix.Notify.success(`Hooray! We found ${allImg} images.`);
       const markup = arrAllAnswer.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => 
        `<div class="photo-card">
        <a href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
  </div>
</div>`
    ).join("");
    gallery.insertAdjacentHTML("beforeend", markup)

    let showImg = new SimpleLightbox('.gallery a');
    showImg.on('show.simplelightbox');
    showImg.refresh();

    if ((allImg / per_page) > page) {
        loadBtn.classList.remove('hidden')
    } else {
        loadBtn.classList.add('hidden');
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
   }

function onLoadMore() {
    page += 1;
     
    pixabayApi(searchValue).then(data => {
        gallery.insertAdjacentHTML("beforeend", createMarkup(data));
        console.log(data.pages);
      
    })
}

function clearMarkup() {
    gallery.innerHTML = "";
}