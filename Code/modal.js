class ReportModal{
    constructor({
        title,
        details,
        date,
        reporter,
        reported,
    }){
        this.title = title;
        this.details = details;
        this.date = date;
        this.reporter = reporter;
        this.reported = reported;
    }

    createAndOpen(){
        this.modalElem = document.createElement('div');
        this.modalElem.classList.add('modal');
        setTimeout(()=>{
            this.modalElem.classList.add('open');
        }, 400);

        const modalContentElem = document.createElement('div');
        modalContentElem.classList.add('content');

        this.modalElem.appendChild(modalContentElem);

        //title
        const titleTextElem = document.createElement('p');
        titleTextElem.classList.add('title');
        titleTextElem.textContent = this.title;

        //details
        modalContentElem.appendChild(detailsTextElem);

        const detailsTextElem = document.createElement('p');
        detailsTextElem.classList.add('details');
        detailsTextElem.textContent = this.details;

        modalContentElem.appendChild(detailsTextElem);

        document.body.appendChild(this.modalElem);
    }


}