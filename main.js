//Load a Book from disk
function loadBook(fileName, displayName) {
  let currentBook = "";
  let url = "books/" + fileName

  //Select Document
  const fileContent = document.querySelector('#fileContent')
  const selectFileName = document.querySelector('#fileName')
  const selectSearchstat = document.querySelector('#searchstat')
  const selectKeyword = document.querySelector('#keyword')

  //reset our UI
  selectFileName.innerHTML = displayName
  selectSearchstat.innerHTML = ""
  selectKeyword.value = ""


  // Request to the server to load the Books
  let xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.send()

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      currentBook = xhr.responseText
      // console.log(currentBook);
      getDocstats(currentBook)

      //remove line Breaks and carriage returns and replace with a <br>
      currentBook = currentBook.replace(/(?:\r\n|\r|\n)/g, '<br>')

      fileContent.innerHTML = currentBook
      fileContent.scrollTop = 0
    }
  }

}

//get the stats for the books
function getDocstats(fileContent) {

  //Select the Element
  const mostUsed = document.querySelector('#mostUsed')
  const leastUsed = document.querySelector('#leastUsed')
  const doLength = document.querySelector('#doLength')
  const wordcount = document.querySelector('#wordCount')
  const charCount = document.querySelector('#charCount')

  let text = fileContent.toLowerCase()
  let wordArray = text.match(/\b\S+\b/g)
  // console.log(wordArray);
  let wordDictionary = {}

  //filter out the uncommon words
  let uncommonWords = filterStopWords(wordArray)

  //Count every word in the wordArray
  for (let word in uncommonWords) {
    let wordValue = uncommonWords[word]
    if (wordDictionary[wordValue] > 0) {
      wordDictionary[wordValue] += 1
    } else {
      wordDictionary[wordValue] = 1
    }
  }

  //Call the sortArray function
  let wordList = sortProperties(wordDictionary)

  //Return the top 5 words
  let top5Words = wordList.slice(0, 6)
  // console.log(top5Words);

  //Return the least 5 words
  let least5Words = wordList.slice(-6, wordList.length)

  //Write the to the page 
  ULTemplate(top5Words, mostUsed)
  ULTemplate(least5Words, leastUsed)

  doLength.innerHTML = 'Document Length: ' + text.length;
  wordcount.innerHTML = 'Word Count ' + wordArray.length;
  let modifyChar = text.replace(/ /g, '')
  charCount.innerHTML = 'Character Count: ' + modifyChar.length;
}

function ULTemplate(items, element) {
  const rowTemplate = document.querySelector('#template-ul-items').innerHTML
  let resultsHTML = ""

  for (let i = 0; i < items.length - 1; i++) {
    resultsHTML += rowTemplate.replace('{{val}}', items[i][0] + " : " + items[i][1] + ' time(s)')
  }
  element.innerHTML = resultsHTML

}


//sorting the object properties and turn it into a newArray named by rtnArray
function sortProperties(wordDictionary) {
  // first convert the object to an array 
  let rtnArray = Object.entries(wordDictionary)

  //Sort the array 
  rtnArray.sort((first, second) => {
    return second[1] - first[1]
  })

  return rtnArray
}

function filterStopWords(wordArray) {
  let commonWords = getStopWords()
  let commonObj = {}
  let uncommonArr = []

  for (let i = 0; i < commonWords.length; i++) {
    commonObj[commonWords[i]] = true
  }

  for (let i = 0; i < wordArray.length; i++) {
    word = wordArray[i].toLowerCase()
    if (!commonObj[word]) {
      uncommonArr.push(word)
    }
  }
  return uncommonArr;
}

//a list of stop words we don't want to include in stats
function getStopWords() {
  return ["a", "able", "about", "across", "after", "all",
    "almost", "also", "am", "among", "an", "and", "any",
    "are", "as", "at", "be", "because", "been", "but", "by",
    "can", "cannot", "could", "dear", "did", "do", "does",
    "either", "else", "ever", "every", "for", "from",
    "get", "got", "had", "has", "have", "he", "her",
    "hers", "him", "his", "how", "however", "i", "if",
    "in", "into", "is", "it", "its", "just", "least",
    "let", "like", "likely", "may", "me", "might", "most",
    "must", "my", "neither", "no", "nor", "not", "of", "off",
    "often", "on", "only", "or", "other", "our", "own", "rather"
    , "said", "say", "says", "she", "should", "since", "so", "some",
    "than", "that", "the", "their", "them", "then", "there", "these",
    "they", "this", "tis", "to", "too", "twas", "us", "wants", "was",
    "we", "were", "what", "when", "where", "which", "while", "who", "whom",
    "why", "will", "with", "would", "yet", "you", "your", "ain't", "aren't",
    "can't", "could've", "couldn't", "didn't", "doesn't", "don't", "hasn't",
    "he'd", "he'll", "he's", "how'd", "how'll", "how's", "i'd", "i'll", "i'm",
    "i've", "isn't", "it's", "might've", "mightn't", "must've", "mustn't", "shan't",
    "she'd", "she'll", "she's", "should've", "shouldn't", "that'll", "that's", "there's",
    "they'd", "they'll", "they're", "they've", "wasn't",
    "we'd", "we'll", "we're", "weren't", "what'd", "what's",
    "when'd", "when'll", "when's", "where'd", "where'll", "where's",
    "who'd", "who'll", "who's", "why'd", "why'll", "why's", "won't",
    "would've", "wouldn't", "you'd", "you'll", "you're", "you've"]
}

//Highlight the words in search
function performMark() {

  //Select the necessary element
  let keyword = document.querySelector('#keyword').value
  let display = document.querySelector('#fileContent')

  var newContent = "";

  //find all the currently marked items
  let spans = document.querySelectorAll('mark');

  for (let i = 0; i < spans.length; i++) {
    spans[i].outerHTML = spans[i].innerHTML
  }

  var re = new RegExp(keyword, 'gi');
  var replaceText = "<mark id='markme'>$&</mark>"
  var bookContent = display.innerHTML;

  //mark the element
  newContent = bookContent.replace(re, replaceText)
  display.innerHTML = newContent;

  let count = document.querySelectorAll('mark').length
  let searchstat = document.querySelector('#searchstat')

  searchstat.innerHTML = 'found ' + count + ' matches';

  if (count > 0) {
    let element = document.querySelector('#markme')
    element.scrollIntoView()
  }

}
