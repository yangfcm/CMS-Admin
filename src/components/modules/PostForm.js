import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { reduxForm, Field, change, formValueSelector } from "redux-form";
import {
  Typography,
  Container,
  Button,
  Grid,
  Modal,
  Backdrop,
  Fade,
  Box,
  CircularProgress
} from "@material-ui/core";
import PublishOutlinedIcon from "@material-ui/icons/PublishOutlined";
import SaveOutlinedIcon from "@material-ui/icons/SaveOutlined";
import PanoramaOutlinedIcon from "@material-ui/icons/PanoramaOutlined";
import { withStyles } from "@material-ui/core/styles";

import {
  RenderTextField,
  RenderSelect,
  RenderCreatableSelect,
  RenderCheckBox
} from "../form/Fields";
import Editor from "../form/Editor";
import FileUpload from "../modals/FileUpload";
import ButtonLink from "../common/ButtonLink";
import { readCategories } from "../../actions/category";
import { readTags, createTag } from "../../actions/tag";
import { clearError } from "../../actions/error";
import { validatePostInput } from "../../utils/validate";

const styles = theme => {
  return {
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #aaa",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      width: "50%",
      minHeight: "20%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }
  };
};

class PostForm extends React.Component {
  state = {
    categoryOptions: null,
    tagOptions: null,
    isFileUploadModalOpen: false
  };

  componentDidMount = async () => {
    if (!this.props.category || this.props.category.length === 0) {
      // console.log('read category');
      await this.props.readCategories();
    }
    if (!this.props.tag || this.props.tag.length === 0) {
      // console.log('read tag');
      await this.props.readTags();
    }
    this.setCategoryOptions();
    this.setTagOptions();
  };

  componentWillUnmount() {}

  formSubmit = formValues => {
    this.props.onSubmit(formValues);
  };

  setCategoryOptions = () => {
    const categoryOptions = [];
    if (this.props.category && this.props.category.length > 0) {
      const categoryArr = this.props.category;
      for (let i = 0; i < categoryArr.length; i++) {
        categoryOptions.push({
          id: categoryArr[i]._id,
          label: categoryArr[i].name,
          value: categoryArr[i].name
        });
      }
      this.setState({ categoryOptions });
    } else {
      this.setState({ categoryOptions: [] });
    }
  };

  setTagOptions = () => {
    if (this.props.tag && this.props.tag.length > 0) {
      const tagArr = this.props.tag;
      const tagOptions = [];
      for (let i = 0; i < tagArr.length; i++) {
        tagOptions.push({
          id: tagArr[i]._id,
          label: tagArr[i].name,
          value: tagArr[i].name
        });
      }
      this.setState({ tagOptions });
    }
  };

  /**
   * When creating a tag on form, add the tag into database.
   * In order to achieve this, we need to customize the behavior of react select
   */
  handleCreateOption = async inputTag => {
    // console.log(inputTag);
    await this.props.createTag({ name: inputTag });
    this.setTagOptions();
    const newTag = this.props.tag[this.props.tag.length - 1];
    // The last one is the tag just created

    this.props.changeTagsValue("tags", [
      ...this.props.tagsValue,
      {
        id: newTag._id,
        label: newTag.name,
        value: newTag.name
      }
    ]);
  };

  handleCloseFileUploadModal = () => {
    this.setState({
      isFileUploadModalOpen: false
    });
  };

  handleImageLoaded = image => {
    console.log(image);
    this.setState({
      imageRef: image
    });
  };

  makeClientCrop = async crop => {
    console.log(this.state.imageRef);
    console.log(crop);
    if (this.state.imageRef && crop.width && crop.height) {
      const imageBase64 = await this.getCroppedImg(
        this.state.imageRef,
        crop,
        "newFile.jpeg"
      );
      // this.setState({ croppedImageUrl });
      this.props.changeFeaturedImageValue("featuredImage", imageBase64);
    }
  };

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      resolve(canvas.toDataURL("image/png", 0.7));
      // canvas.toBlob(blob => {
      //   if (!blob) {
      //     reject(new Error('Canvas is empty'));
      //     // console.error("Canvas is empty");
      //     return;
      //   }
      // 	blob.name = fileName;
      //   window.URL.revokeObjectURL(this.fileUrl);
      //   this.fileUrl = window.URL.createObjectURL(blob);
      //   resolve(this.fileUrl);
      // }, "image/jpeg");
    });
  }

  render() {
    const {
      handleSubmit,
      postStatus,
      classes,
      resetPostStatus,
      clearError
    } = this.props;
    const { croppedImageUrl } = this.state;
    // console.log(this.state.tagOptions);
    return (
      <React.Fragment>
        <form onSubmit={handleSubmit(this.formSubmit)}>
          <Grid container style={{ marginBottom: 10 + "px" }}>
            <Field // Title
              name="title"
              id="title"
              type="text"
              label="Title"
              component={RenderTextField}
            />
          </Grid>
          <Grid container spacing={2} style={{ marginBottom: 10 + "px" }}>
            <Grid item xs={12} sm={4}>
              <Field // Category
                name="category"
                id="category"
                label=""
                placeholder="Category"
                component={RenderSelect}
                options={this.state.categoryOptions || []}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Field // Tags
                name="tags"
                id="tags"
                label=""
                placeholder="Tags"
                isMulti={true}
                component={RenderCreatableSelect}
                options={this.state.tagOptions || []}
                handleCreateOption={this.handleCreateOption}
              />
            </Grid>
          </Grid>
          <Grid container style={{ marginBottom: 10 + "px" }}>
            <Button // Featured image upload button
              variant="outlined"
              color="default"
              onClick={() => {
                this.setState({
                  isFileUploadModalOpen: true
                });
              }}
            >
              <PanoramaOutlinedIcon></PanoramaOutlinedIcon>&nbsp; Featured Image
            </Button>
          </Grid>

          {/* File upload modal*/}
          <Modal
            open={this.state.isFileUploadModalOpen}
            // open={true}
            onClose={this.handleCloseFileUploadModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500
            }}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Fade in={this.state.isFileUploadModalOpen}>
              <FileUpload
                handleClose={this.handleCloseFileUploadModal}
                handleImageLoaded={this.handleImageLoaded}
                handleMakeClientCrop={this.makeClientCrop}
              />
            </Fade>
          </Modal>
          {croppedImageUrl && (
            <img
              src={croppedImageUrl}
              alt="cropped url"
              style={{ maxHeight: 250 + "px" }}
            />
          )}
          {this.props.featuredImageValue && (
            <img
              src={this.props.featuredImageValue}
              alt="cropped url"
              style={{ maxHeight: 250 + "px" }}
            />
          )}
          <Field
            type="hidden"
            id="featuredImage"
            name="featuredImage"
            component={RenderTextField}
          />
          <Field name="content" component={Editor} />
          <Field
            id="isTop"
            name="isTop"
            label="Set as Top"
            component={RenderCheckBox}
          />
          <Box p={3}>
            <Container align="center">
              <Button
                type="button"
                variant="outlined"
                color="primary"
                onClick={handleSubmit(values => {
                  this.props.onSubmit({ ...values, status: "1" });
                  /** status='1' - publish */
                })}
              >
                <PublishOutlinedIcon></PublishOutlinedIcon>
                Publish
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                style={{ marginLeft: 1 + "rem" }}
                onClick={handleSubmit(values => {
                  this.props.onSubmit({ ...values, status: "2" });
                  /** status='2' - draft */
                })}
              >
                <SaveOutlinedIcon></SaveOutlinedIcon>
                Save as draft
              </Button>
            </Container>
          </Box>
        </form>

        <Modal
          open={!!postStatus}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
          onClose={() => {
            resetPostStatus();
          }}
          disableBackdropClick
        >
          <Grid
            className={classes.paper}
            container
            direction="column"
            justify="space-around"
          >
            <Grid item>
              <Typography variant="h6">
                {postStatus === "isDoing" && <CircularProgress />}
                {postStatus === "published" && "Post is created successfully"}
                {postStatus === "saved" && "Post is saved successfully"}
                {postStatus === "failed" && "Operation failed!"}
                {postStatus === "updated" && "Post is updated successfully"}
              </Typography>
            </Grid>
            <Grid item>
              {(postStatus === "published" ||
                postStatus === "saved" ||
                postStatus === "updated") && (
                <Grid container justify="center" alignItems="center">
                  <Grid item>
                    <ButtonLink
                      color="primary"
                      to="/posts"
                      onClick={this.props.reset}
                    >
                      Go to Posts List
                    </ButtonLink>
                  </Grid>
                  <Grid item>
                    <ButtonLink
                      color="secondary"
                      to="/new"
                      onClick={this.props.reset}
                    >
                      Write Another New Post
                    </ButtonLink>
                  </Grid>
                </Grid>
              )}
              {postStatus === "failed" && (
                <Grid container justify="center" alignItems="center">
                  <Grid item>
                    <Button
                      color="primary"
                      onClick={() => {
                        clearError();
                        resetPostStatus();
                      }}
                    >
                      OK
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Modal>
      </React.Fragment>
    );
  }
}

const selector = formValueSelector("post");
const mapStateToProps = (state, ownProps) => {
  const tagsValue = selector(state, "tags"); // Get tags value from post form
  const featuredImageValue = selector(state, "featuredImage"); // Get value of featured image from post form
  // console.log(ownProps);
  const { editPost } = ownProps;
  let initialValues = {};

  if (editPost) {
    const initialCategory = {
      id: editPost.category._id,
      value: editPost.category.name,
      label: editPost.category.name
    };
    const initialTags = editPost.tags.map(tag => {
      return {
        id: tag._id,
        value: tag.name,
        label: tag.name
      };
    });

    initialValues = {
      title: editPost.title,
      content: editPost.content,
      isTop: editPost.isTop,
      category: initialCategory,
      tags: initialTags,
      featuredImage: editPost.featuredImage
    };
  }

  return {
    category: state.category,
    tag: state.tag,
    error: state.error,
    tagsValue: tagsValue || [],
    featuredImageValue,
    initialValues
  };
};

const mapDispatchToProps = dispatch => {
  return {
    readCategories: () => dispatch(readCategories()),
    readTags: () => dispatch(readTags()),
    clearError: () => dispatch(clearError()),
    createTag: (data, callback) => dispatch(createTag(data, callback)),
    changeTagsValue: (field, value) => dispatch(change("post", field, value)),
    changeFeaturedImageValue: (field, value) =>
      dispatch(change("post", field, value))
  };
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  reduxForm({
    form: "post",
    fields: ["tags"],
    validate: validatePostInput,
    destroyOnUnmount: false,
    touchOnBlur: false,
    touchOnChange: true,
    enableReinitialize: true
  })
)(withStyles(styles)(PostForm));
