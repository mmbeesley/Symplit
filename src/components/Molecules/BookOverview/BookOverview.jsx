/** NPM Modules **/
import React, { Component } from "react";

/** Redux **/
import {
  getBook,
  updateBook,
  deleteBook,
  addSavedBook,
  removeSavedBook,
  getSavedBooks
} from "../../../ducks/reducers";
import { connect } from "react-redux";

/** Import Components **/
import AdminButton from "../../Atoms/AdminButton/AdminButton";
import BookModal from "../../Modals/BookModal";
import DeleteModal from "../../Modals/DeleteModal";

/** Exported Component **/
class BookOverview extends Component {
  constructor() {
    super();

    this.state = {
      book_title: "",
      book_subtitle: "",
      book_image: "",
      book_subject: "",
      author: "",
      membership_required_book: false,
      membership_ids_book: "",
      visible: false,
      editModal: false,
      deleteModal: false
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.updateBook = this.updateBook.bind(this);
    this.deleteBook = this.deleteBook.bind(this);
    this.addToSaved = this.addToSaved.bind(this);
    this.removeFromSaved = this.removeFromSaved.bind(this);
  }

  /** LifeCycle Methods **/
  componentDidMount() {
    const { getBook, id } = this.props;
    getBook(id);
    getSavedBooks();
  }

  static getDerivedStateFromProps(props, state) {
    const { book } = props;
    if (book.book_id !== state.book_id) {
      return { ...book };
    }
    return null;
  }

  /** Interaction Methods **/
  openModal(type) {
    const key = `${type}Modal`;
    this.setState({
      [key]: true
    });
  }

  closeModal(type) {
    const key = `${type}Modal`;
    this.setState({
      [key]: false
    });
  }

  handleInputUpdate(key, value) {
    this.setState({
      [key]: value
    });
  }

  handleImage() {
    let _this = this;
    window.cloudinary.openUploadWidget(
      { cloud_name: "symplit", upload_preset: "rg7skvww" },
      function(error, result) {
        for (var i = result[0].path.length - 1; i > 0; i--) {
          if (result[0].path[i] === "/") {
            break;
          }
          _this.setState({
            book_image: result[0].path.slice(i)
          });
        }
      }
    );
  }

  updateBook() {
    const {
      book_title,
      book_subtitle,
      book_image,
      book_subject,
      author,
      membership_required_book,
      membership_ids_book,
      visible
    } = this.state;
    const { book, updateBook } = this.props;
    const body = {
      book_title,
      book_subtitle,
      book_image,
      book_subject,
      author,
      membership_required_book,
      membership_ids_book,
      visible
    };
    const id = book.book_id;

    updateBook(id, body);
  }

  deleteBook() {
    const { book, deleteBook } = this.props;
    const id = book.book_id;

    deleteBook(id);
  }

  addToSaved() {
    const { book, addSavedBook } = this.props;
    addSavedBook(book.book_id);
  }

  removeFromSaved() {
    const { book, removeSavedBook } = this.props;
    removeSavedBook(book.book_id);
  }

  /** Render Methods **/
  render() {
    const { book, user, savedBooks } = this.props;
    const {
      editModal,
      deleteModal,
      book_title,
      book_subtitle,
      book_image,
      book_subject,
      author,
      membership_required_book,
      membership_ids_book,
      visible
    } = this.state;

    let isSaved =
      savedBooks &&
      savedBooks.length &&
      savedBooks.findIndex(function(savedBook) {
        return savedBook.book_id === book.book_id;
      }) !== -1
        ? true
        : false;

    let imageUrl = `http://res.cloudinary.com/symplit/image/upload/${book_image}`;

    let authorMap =
      author && author.length > 0
        ? author.map((e, i) => {
            return <div key={i}>{e}</div>;
          })
        : null;

    let addRemoveButton = !user.user_id ? null : isSaved ? (
      <button className="savedbookbutton" onClick={this.removeFromSaved}>
        Remove from Saved Books
      </button>
    ) : (
      <button className="savedbookbutton" onClick={this.addToSaved}>
        Add to Saved Books
      </button>
    );

    return (
      <div className="bookoverview">
        <img src={imageUrl} alt="Book" className="singlebookimage" />
        <div className="booksummary">
          <h1>{book_title}</h1>
          <h2>{book_subtitle}</h2>
          <h3>{authorMap}</h3>
          {addRemoveButton}
          <div className="adminbuttoncontainer">
            {!user.is_admin ? null : (
              <AdminButton
                onClick={() => this.openModal("edit", book.book_id)}
                color="blue"
              >
                Edit
              </AdminButton>
            )}
            {!user.is_admin ? null : (
              <AdminButton
                onClick={() => this.openModal("delete", book.book_id)}
                color="blue"
              >
                Delete
              </AdminButton>
            )}
          </div>
        </div>

        <BookModal
          active={editModal}
          closeModal={() => this.closeModal("edit")}
          onChange={this.handleInputUpdate}
          handleImage={this.handleImage}
          book_title={book_title}
          book_subtitle={book_subtitle}
          book_image={book_image}
          book_subject={book_subject}
          author={author}
          membership_required_book={membership_required_book}
          membership_ids_book={membership_ids_book}
          visible={visible}
          submit={this.updateBook}
        />

        <DeleteModal
          active={deleteModal}
          closeModal={() => this.closeModal("delete")}
          submit={this.deleteBook}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    book: state.book,
    user: state.user,
    savedBooks: state.savedBooks
  };
}

export default connect(
  mapStateToProps,
  {
    getBook,
    updateBook,
    deleteBook,
    getSavedBooks,
    addSavedBook,
    removeSavedBook
  }
)(BookOverview);
