import fs from 'fs';
import path from 'path';
import mjml2html from 'mjml';

// Template variable types
type EmailTemplateVars = {
    welcome: { name: string };
    passwordReset: { resetLink: string };
    githubLinked: { username: string };
    test: { timestamp: string };
};

type TemplateName = keyof EmailTemplateVars;

export function renderEmailTemplate<T extends TemplateName>(
    templateName: T,
    data: EmailTemplateVars[T]
): string {
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'email', `${templateName}.mjml`);
    let template = fs.readFileSync(templatePath, 'utf-8');

    // Replace all variables in the template
    Object.entries(data).forEach(([key, value]) => {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    // Convert MJML to HTML
    const { html } = mjml2html(template);
    return html;
} 