import Image from "next/image";

export default function Post({
  children,
  title,
  image,
  link,
  titleClass = "",
}: {
  children?: React.ReactNode;
  title?: string;
  image?: string;
  link?: string;
  titleClass?: string;
}) {
  return (
    <div className="w-4xl post-block">
      {title && <h1 className={titleClass}>{title}</h1>}
      <div className="content">
        {image && (
          <Image src={image} alt={title || ""} width={800} height={800} />
        )}
        {children && (
          <div>
            {children}
            {link && (
              <div className="link">
                <a href={link}>CHECK IT OUT &gt;&gt;&gt;</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
