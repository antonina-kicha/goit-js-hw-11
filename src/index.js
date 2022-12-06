import axios from 'axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';

const searchForm = document.querySelector('.search-form');
const search = document.querySelector('[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more')
let page = 1;
const per_page = 40;
let allImg = 0;
let typeNotification;
let searchValue;
searchForm.addEventListener('submit', onSearch);
loadBtn.addEventListener('click', onLoadMore)

// По клику берет введенное в поиск значение, вызывает pixabayApi для получения картинок
function onSearch(evt) {
    evt.preventDefault();
    clearMarkup();
    searchValue = search.value.trim();
  if (!searchValue) {
    typeNotification = "failure";
      Notification();
      return;
    }
    pixabayApi(searchValue);
}

// Функция для уведомлений
function Notification() {
  switch (typeNotification) {
    case "failure":
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
      break;
    case "success":
    Notiflix.Notify.success(`Hooray! We found ${allImg} images.`);
      break;

  default:
    console.log("Not massege for user");
  }
  
}

// Очистка разметки
function clearMarkup() {
  gallery.innerHTML = "";
  loadBtn.classList.add('hidden');
  page = 1;
}

async function pixabayApi(searchValue) {
  const BASE_URL = 'https://pixabay.com/api/';
  const apiKey = '31841001-51f92be338cf42306cf8849f6';
  const queryParams = 'image_type=photo&orientation=horizontal&safesearch=true'
    
  try {
    const response = await axios.get(`${BASE_URL}?key=${apiKey}&q=${searchValue}&${queryParams}&page=${page}&per_page=${per_page}`)
    const arrAllAnswer = response.data.hits;
    if (!arrAllAnswer.length) {
          typeNotification = "failure";
          Notification();
          return;
        }
    allImg = response.data.totalHits;
    if (allImg && page === 1) {
      typeNotification = "success";
        Notification();
      }

    createMarkup(arrAllAnswer);
    visibleHiddenBtnLoadMore();
    galleryWithSimpleLightbox();
    return response;
   } catch (error) {
      if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
          console.log(error.config);  }
}


// Создание разметки
function createMarkup(arrAllAnswer) {

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
}


  // отображение большой версии изображения с библиотекой SimpleLightbox для полноценной галереи.
function galleryWithSimpleLightbox() {
   let showImg = new SimpleLightbox('.gallery a');
    showImg.on('show.simplelightbox');
    showImg.refresh();
}


// Управление видимостью кнопки LoadMore
function visibleHiddenBtnLoadMore() {
    if ((allImg / per_page) > page) {
        loadBtn.classList.remove('hidden')
    } else {
        loadBtn.classList.add('hidden');
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
}

// Загрузка новых картинок по клику на LoadMore
function onLoadMore() {
    page += 1;
  pixabayApi(searchValue);
}