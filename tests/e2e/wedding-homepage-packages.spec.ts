import { expect, test } from '../support/fixtures';

test.describe('Wedding Homepage Sections', () => {
  test.beforeEach(async ({ page, setMode }) => {
    // GIVEN: User is in Wedding Mode
    await setMode('wedding');
    await page.goto('/en/wedding-home?e2e=1');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render Packages Section with 3 distinct tiers', async ({ page }) => {
    // GIVEN: Target-First Check - scroll to section
    const section = page.getByTestId('packages-section');
    await section.scrollIntoViewIfNeeded();

    // THEN: Section heading should be visible
    await expect(section.getByText(/CHOOSE YOUR STORY/i)).toBeVisible();

    // AND: Should have 3 package cards
    const cards = section.getByTestId('package-card');
    await expect(cards).toHaveCount(3);

    // AND: One card should be highlighted (featured)
    const featuredCard = section.locator('[data-featured="true"]');
    await expect(featuredCard).toBeVisible();
    await expect(featuredCard).toHaveCSS('background-color', 'rgb(91, 67, 57)'); // Based on design brown color #5b4339
  });

  test('should navigate Testimonials Carousel using arrows', async ({ page }) => {
    // GIVEN: Testimonials section is visible
    const section = page.getByTestId('testimonial-section');
    await section.scrollIntoViewIfNeeded();

    // WHEN: We note the current testimonial
    const firstTestimonial = section.getByTestId('testimonial-item').filter({ visible: true });
    const initialText = await firstTestimonial.innerText();

    // AND: We click the next arrow
    await section.getByTestId('carousel-next').click();

    // THEN: A different testimonial should be visible
    const nextTestimonial = section.getByTestId('testimonial-item').filter({ visible: true });
    await expect(nextTestimonial).not.toHaveText(initialText);
  });

  test('should display Philosophy Section with Serif typography', async ({ page }) => {
    // GIVEN: Philosophy section is visible
    const section = page.getByTestId('philosophy-section');
    await section.scrollIntoViewIfNeeded();

    // THEN: The main quote should use Serif font
    const quote = section.getByTestId('philosophy-quote');
    await expect(quote).toHaveCSS('font-family', /Cormorant Garamond/);
    await expect(quote).toContainText(/We take our craft to heart/);
  });

  test('should use Wedding mode color palette consistently', async ({ page }) => {
    // THEN: Background should be Ivory White for all new sections
    const packages = page.getByTestId('packages-section');
    const testimonials = page.getByTestId('testimonial-section');
    const philosophy = page.getByTestId('philosophy-section');

    // We check the computed background of the section shells
    // Note: Some might have ivory background while others might be transparent over the body
    await expect(packages).toHaveCSS('background-color', /rgba?\(250, 247, 242/);
    await expect(testimonials).toHaveCSS('background-color', /rgba?\(250, 247, 242/);
    await expect(philosophy).toHaveCSS('background-color', /rgba?\(250, 247, 242/);
  });
});
