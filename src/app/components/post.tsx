import Image from "next/image";

export default function Post({
  children,
  title,
  image,
  link,
  linkText = "TRY IT OUT",
  titleClass = "",
}: {
  children?: React.ReactNode;
  title?: string;
  image?: string;
  link?: string;
  linkText?: string;
  titleClass?: string;
}) {
  const noImage = !image;
  return (
    <div className="post-block">
      {title && <h1 className={titleClass}>{title}</h1>}
      <div className="content flex flex-col lg:grid-cols-2 lg:grid">
        {image && (
          <Image src={image} alt={title || ""} width={800} height={800} />
        )}
        {children && (
          <div className={noImage ? "col-span-2" : ""}>
            {children}
            {link && (
              <div className="link">
                <a href={link} target="_blank">
                  {linkText}&nbsp;&gt;&gt;&gt;
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
