import React from "react";
import { format, formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";
function Post({ _id, title, summary, cover, content, createdAt, author }) {
  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={"http://localhost:4000/" + cover} alt="/"></img>
        </Link>
        {/* <img src="client/Screenshot from 2023-09-02 17-19-56.png"></img> */}
      </div>
      <div className="text">
        <Link to={`/post/${_id}`}>
          <h2>{title} </h2>
        </Link>
        <p className="info">
          <name className="author">{author.username}</name>
          <time>{format(new Date(createdAt), "MMM d, yyy HH:mm")}</time>
          {/* ALTERNATE DATE FORMAT BELOW */}
          {/* <time>{formatISO9075(new Date(createdAt))}</time> */}
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
}

export default Post;
